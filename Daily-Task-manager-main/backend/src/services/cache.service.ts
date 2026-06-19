import { createClient, RedisClientType } from 'redis';
import logger from '../config/logger';

class CacheService {
  private client: RedisClientType | null = null;
  private connected: boolean = false;

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      this.client = createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        },
        password: process.env.REDIS_PASSWORD,
        database: parseInt(process.env.REDIS_DB || '0')
      });

      this.client.on('error', (err) => {
        logger.error('Redis connection error', { error: err.message });
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
      });

      this.client.on('ready', () => {
        logger.info('Redis ready');
      });

      await this.client.connect();
      this.connected = true;
      logger.info('Redis cache service initialized');
    } catch (error: any) {
      logger.error('Failed to connect to Redis', { error: error.message });
      this.connected = false;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
      logger.info('Redis disconnected');
    }
  }

  /**
   * Check if cache service is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.connected || !this.client) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error: any) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T = any>(key: string, value: T, ttlSeconds: number = 300): Promise<boolean> {
    if (!this.connected || !this.client) return false;

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error: any) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.connected || !this.client) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error: any) {
      logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async mDelete(keys: string[]): Promise<number> {
    if (!this.connected || !this.client) return 0;

    try {
      return await this.client.del(keys);
    } catch (error: any) {
      logger.error('Cache mDelete error', { error: error.message });
      return 0;
    }
  }

  /**
   * Delete by pattern
   */
  async deleteByPattern(pattern: string): Promise<number> {
    if (!this.connected || !this.client) return 0;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      return await this.client.del(keys);
    } catch (error: any) {
      logger.error('Cache deleteByPattern error', { pattern, error: error.message });
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (!this.connected || !this.client) return;

    try {
      await this.client.flushDb();
      logger.info('Cache cleared');
    } catch (error: any) {
      logger.error('Cache clear error', { error: error.message });
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    if (!this.connected || !this.client) return null;

    try {
      const info = await this.client.info('memory');
      const dbSize = await this.client.dbSize();
      return {
        connected: true,
        memoryInfo: info,
        dbSize,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      logger.error('Cache stats error', { error: error.message });
      return null;
    }
  }

  /**
   * Cache key generators
   */
  keys = {
    user: (userId: string, variant: string = '') => `user:${userId}${variant ? ':' + variant : ''}`,
    task: (taskId: string) => `task:${taskId}`,
    userTasks: (userId: string, filters: string = '') => `user:${userId}:tasks${filters ? ':' + filters : ''}`,
    teamTasks: (teamId: string) => `team:${teamId}:tasks`,
    analytics: (userId: string, period: string) => `analytics:${userId}:${period}`,
    leaderboard: (type: string) => `leaderboard:${type}`,
    session: (sessionId: string) => `session:${sessionId}`,
    search: (userId: string, query: string) => `search:${userId}:${query}`,
    aiSuggestions: (userId: string) => `ai:suggestions:${userId}`,
    rateLimit: (userId: string, endpoint: string) => `ratelimit:${userId}:${endpoint}`
  };
}

// Singleton instance
let cacheServiceInstance: CacheService | null = null;

export const getCacheService = async (): Promise<CacheService> => {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService();
    await cacheServiceInstance.connect();
  }
  return cacheServiceInstance;
};

export default CacheService;
