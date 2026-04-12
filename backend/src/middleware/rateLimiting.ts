import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { getCacheService } from '../services/cache.service';

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMITS = {
  // Per-user limits
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 attempts
  },
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3 // 3 registrations
  },
  api: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000 // 1000 requests per hour
  },
  ai: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100 // 100 AI requests per hour
  },
  payment: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50 // 50 payment attempts
  }
};

/**
 * Generic rate limit middleware using Redis
 */
export const createRateLimiter = (config: { windowMs: number; maxRequests: number }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cache = await getCacheService();
    
    if (!cache.isConnected()) {
      // If Redis is down, bypass rate limiting with warning
      logger.warn('Rate limiting bypassed - Redis unavailable');
      return next();
    }

    const key = `ratelimit:${req.user?.id || req.ip}:${req.path}`;
    const ttl = Math.ceil(config.windowMs / 1000);
    
    try {
      // Get current count
      const currentCount = await cache.get<number>(key) || 0;
      
      if (currentCount >= config.maxRequests) {
        logger.warn('Rate limit exceeded', {
          key,
          current: currentCount,
          limit: config.maxRequests,
          userId: req.user?.id,
          ip: req.ip
        });

        return res.status(429).json({
          success: false,
          error: 'RATE_LIMITED',
          message: 'Too many requests, please try again later',
          errorCode: 429,
          retryAfter: Math.ceil(ttl)
        });
      }

      // Increment counter
      await cache.set(key, currentCount + 1, ttl);
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (config.maxRequests - currentCount - 1).toString());
      res.setHeader('X-RateLimit-Reset', (Date.now() + config.windowMs).toString());

      next();
    } catch (error: any) {
      logger.error('Rate limiting error', { error: error.message });
      // On error, allow request but log
      next();
    }
  };
};

/**
 * Specific rate limiters for different endpoints
 */
export const loginLimiter = createRateLimiter(RATE_LIMITS.login);
export const registerLimiter = createRateLimiter(RATE_LIMITS.register);
export const apiLimiter = createRateLimiter(RATE_LIMITS.api);
export const aiLimiter = createRateLimiter(RATE_LIMITS.ai);
export const paymentLimiter = createRateLimiter(RATE_LIMITS.payment);

/**
 * Adaptive rate limiting - adjusts based on server load
 */
export const adaptiveRateLimiter = (baseLimiter: ReturnType<typeof createRateLimiter>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Check server load
    const memUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;
    
    if (memUsage > 0.85) {
      // Under heavy load, increase rate limiting
      logger.warn('Adaptive rate limiting activated', {
        memoryUsage: `${(memUsage * 100).toFixed(2)}%`
      });

      return res.status(429).json({
        success: false,
        error: 'SERVICE_BUSY',
        message: 'Service is busy, please try again later',
        errorCode: 503
      });
    }

    // Normal rate limiting
    baseLimiter(req, res, next);
  };
};

/**
 * Cost-based rate limiting for AI endpoints
 * Charges tokens instead of just counting requests
 */
export const aiCostRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const cache = await getCacheService();
  const userId = req.user?.id;
  
  if (!userId || !cache.isConnected()) {
    return next();
  }

  // Daily AI cost limit: $5
  const DAILY_COST_LIMIT = 5;
  const key = `ai:cost:${userId}:${new Date().toISOString().split('T')[0]}`;
  
  try {
    const dailyCost = (await cache.get<number>(key)) || 0;
    
    // Attach cost tracker to request for later use
    (req as any).getCurrentAICost = () => dailyCost;
    (req as any).getRemainingAIBudget = () => DAILY_COST_LIMIT - dailyCost;
    
    if (dailyCost >= DAILY_COST_LIMIT) {
      logger.warn('Daily AI budget exceeded', {
        userId,
        dailyCost,
        limit: DAILY_COST_LIMIT
      });

      return res.status(429).json({
        success: false,
        error: 'BUDGET_LIMIT_EXCEEDED',
        message: 'Daily AI budget limit exceeded',
        errorCode: 429,
        retryDate: new Date(new Date().setDate(new Date().getDate() + 1))
      });
    }

    next();
  } catch (error: any) {
    logger.error('AI cost rate limiting error', { error: error.message });
    next();
  }
};

/**
 * Whitelist-based rate limiter (for trusted IPs/users)
 */
export const whitelist = new Set([
  // Admin IPs
  '203.0.113.45', // office IP
  // Service IPs
  '198.51.100.0/24'
]);

export const whitelistRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip;
  
  // Check if in whitelist
  for (const entry of whitelist) {
    if (entry.includes('/')) {
      // Handle CIDR range
      if (ipInRange(clientIp!, entry)) {
        return next();
      }
    } else if (entry === clientIp) {
      return next();
    }
  }

  // Not whitelisted, apply rate limit
  apiLimiter(req, res, next);
};

/**
 * Helper function to check if IP is in CIDR range
 */
function ipInRange(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  const mask = ~(Math.pow(2, 32 - parseInt(bits)) - 1);
  
  const ipNum = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  const rangeNum = range.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  
  return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Rate limit monitoring - logs statistics
 */
export const rateLimitMonitor = async () => {
  const cache = await getCacheService();
  
  // Get all rate limit keys
  const keys = await cache.get('ratelimit:*');
  
  if (keys) {
    logger.info('Rate Limit Statistics', {
      activeRateLimits: Array.isArray(keys) ? keys.length : 0,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Reset rate limits (for testing or emergency)
 */
export const resetRateLimits = async (userId?: string) => {
  const cache = await getCacheService();
  const pattern = userId ? `ratelimit:${userId}:*` : 'ratelimit:*';
  
  const deleted = await cache.deleteByPattern(pattern);
  logger.info('Rate limits reset', { pattern, deleted });
  
  return deleted;
};
