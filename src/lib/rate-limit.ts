import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
let redisAvailable: boolean | null = null;

function getRedis(): Redis | null {
  if (redisAvailable === false) {
    return null;
  }

  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN ||
        process.env.UPSTASH_REDIS_REST_URL === '' || process.env.UPSTASH_REDIS_REST_TOKEN === '') {
      redisAvailable = false;
      return null;
    }
    try {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      redisAvailable = true;
    } catch {
      redisAvailable = false;
      return null;
    }
  }
  return redis;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  vote: { windowMs: 60 * 1000, maxRequests: 30 },
  upload: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
  compare: { windowMs: 60 * 1000, maxRequests: 60 },
  report: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  default: { windowMs: 60 * 1000, maxRequests: 100 },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

export async function checkRateLimit(
  identifier: string,
  action: keyof typeof RATE_LIMITS = 'default'
): Promise<RateLimitResult> {
  try {
    const redisClient = getRedis();

    // If Redis is not available, allow all requests (dev mode)
    if (!redisClient) {
      return { allowed: true, remaining: 999, resetIn: 0 };
    }

    const config = RATE_LIMITS[action] || RATE_LIMITS.default;
    const key = `ratelimit:${action}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Remove old entries
    await redisClient.zremrangebyscore(key, 0, windowStart);

    // Count current requests
    const count = await redisClient.zcard(key);

    if (count >= config.maxRequests) {
      const oldestRequest = await redisClient.zrange(key, 0, 0, { withScores: true }) as Array<{ score: number; member: string }>;
      const resetIn =
        oldestRequest.length > 0
          ? Math.ceil((Number(oldestRequest[0].score) + config.windowMs - now) / 1000)
          : Math.ceil(config.windowMs / 1000);

      return { allowed: false, remaining: 0, resetIn };
    }

    // Add new request
    await redisClient.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    await redisClient.expire(key, Math.ceil(config.windowMs / 1000));

    return {
      allowed: true,
      remaining: config.maxRequests - count - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
    };
  } catch (error) {
    // If Redis fails, allow the request (fail open)
    console.error('Rate limit check failed:', error);
    return { allowed: true, remaining: 999, resetIn: 0 };
  }
}

export async function resetRateLimit(identifier: string, action: string): Promise<void> {
  try {
    const redisClient = getRedis();
    if (!redisClient) return;

    const key = `ratelimit:${action}:${identifier}`;
    await redisClient.del(key);
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
  }
}
