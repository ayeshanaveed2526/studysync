import Redis from 'ioredis';
import { env } from '../config';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.info('🔴 Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});
