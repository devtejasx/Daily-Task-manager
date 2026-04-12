import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request logging middleware - logs all incoming requests
 */
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  // Store request ID in response header
  res.setHeader('X-Request-ID', requestId as string);
  
  // Store in request for later use
  (req as any).requestId = requestId;
  (req as any).startTime = startTime;

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusClass = Math.floor(res.statusCode / 100);

    // Only log non-health-check requests
    if (!['/health', '/ready'].includes(req.path)) {
      const logData = {
        requestId,
        method: req.method,
        path: req.path,
        query: Object.keys(req.query).length ? req.query : undefined,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: (req as any).user?.id,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        contentLength: res.get('content-length'),
        timestamp: new Date().toISOString()
      };

      // Choose log level based on status code
      if (statusClass === 5) {
        logger.error('HTTP Request Failed', logData);
      } else if (statusClass === 4) {
        logger.warn('HTTP Request Error', logData);
      } else {
        logger.info('HTTP Request', logData);
      }
    }
  });

  next();
};

/**
 * Error handling middleware
 */
export const errorHandlerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId;
  const startTime = (req as any).startTime;
  const duration = startTime ? Date.now() - startTime : 0;

  // Determine error status code
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Log the error
  logger.error('Request Error Handler', {
    requestId,
    statusCode,
    errorCode,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.id,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: errorCode,
    message,
    errorCode: statusCode,
    requestId,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

/**
 * Validation error middleware
 */
export const validationErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.errors && Array.isArray(err.errors)) {
    const requestId = (req as any).requestId;

    logger.warn('Validation Error', {
      requestId,
      path: req.path,
      errors: err.errors.map((e: any) => ({
        field: e.path,
        message: e.msg
      })),
      userId: (req as any).user?.id
    });

    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      errorCode: 400,
      details: err.errors.map((e: any) => ({
        field: e.path,
        message: e.msg
      })),
      requestId,
      timestamp: new Date().toISOString()
    });
  }

  next(err);
};

/**
 * 404 Not Found middleware
 */
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId;

  logger.warn('Route Not Found', {
    requestId,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.id
  });

  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    errorCode: 404,
    requestId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Async error wrapper - wraps async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Database query monitoring middleware
 */
export const queryPerformanceMiddleware = (query: string, duration: number, params?: any[]) => {
  if (duration > 1000) {
    // Log slow queries (> 1 second)
    logger.warn('Slow Database Query', {
      query,
      duration: `${duration}ms`,
      params: params?.length || 0
    });
  } else if (process.env.LOG_LEVEL === 'debug') {
    logger.debug('Database Query', {
      query,
      duration: `${duration}ms`,
      params: params?.length || 0
    });
  }
};

/**
 * Performance timing middleware
 */
export const performanceTimingMiddleware = (name: string, duration: number, threshold: number = 200) => {
  if (duration > threshold) {
    logger.warn('Performance Warning', {
      operation: name,
      duration: `${duration}ms`,
      threshold: `${threshold}ms`
    });
  }
};

/**
 * Security event logging middleware
 */
export const securityEventMiddleware = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', data?: any) => {
  logger.warn('Security Event', {
    event,
    severity,
    ...data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Sanitize sensitive data from logs
 */
export const sanitizeLogData = (data: any): any => {
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'creditCard',
    'ssn',
    'apiSecret',
    'authorization'
  ];

  const sanitized = JSON.parse(JSON.stringify(data));

  const sanitizeObject = (obj: any) => {
    for (const key in obj) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        obj[key] = '***REDACTED***';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  sanitizeObject(sanitized);
  return sanitized;
};
