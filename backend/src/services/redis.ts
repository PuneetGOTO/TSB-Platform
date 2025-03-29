import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

let redisClient: Redis;

/**
 * Connects to Redis for caching and pub/sub messaging
 * Optimized for Upstash Redis on Railway
 */
export async function connectRedis(): Promise<Redis> {
  try {
    redisClient = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableAutoPipelining: true,
      connectTimeout: 10000,
      // Optimize connection to reduce Railway resource usage
      connectionName: 'tsb-platform',
      lazyConnect: false, // Connect immediately to detect errors early
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error', err);
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis');
    });

    // Test connection
    await redisClient.ping();

    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
}

/**
 * Returns the Redis client for operations
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redisClient;
}

/**
 * Publishes a message to a Redis channel
 */
export async function publishMessage(channel: string, message: any) {
  const client = getRedisClient();
  await client.publish(channel, typeof message === 'string' ? message : JSON.stringify(message));
}

/**
 * Creates a subscriber for a Redis channel
 */
export function createSubscriber(channels: string[], messageHandler: (channel: string, message: string) => void) {
  const subscriber = new Redis(config.REDIS_URL);
  subscriber.subscribe(...channels);
  subscriber.on('message', messageHandler);
  return subscriber;
}

/**
 * Closes the Redis connection
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
}
