import { createClient } from 'redis'
import logger from './logger'

// Shared Redis client for feature services (focus mode, etc.). Connection is
// explicit so importing this module has no side effects in tests.
export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

redis.on('error', (err) => {
  logger.error('Redis client error', { error: err.message })
})

export const connectRedis = async (): Promise<void> => {
  if (!redis.isOpen) {
    await redis.connect()
  }
}
