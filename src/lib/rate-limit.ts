import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
let redisAvailable: boolean | null = null;

// In-memory fallback rate limiting when Redis is unavailable
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of inMemoryStore.entries()) {
    if (value.resetAt < now) {
      inMemoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

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

// Fallback in-memory rate limiting
function checkInMemoryRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const entry = inMemoryStore.get(key);

  // Use stricter limits when Redis is down (50% of normal)
  const maxRequests = Math.ceil(config.maxRequests / 2);

  if (!entry || entry.resetAt < now) {
    // New window
    inMemoryStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetAt - now) / 1000),
  };
}

export async function checkRateLimit(
  identifier: string,
  action: keyof typeof RATE_LIMITS = 'default'
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[action] || RATE_LIMITS.default;

  try {
    const redisClient = getRedis();

    // If Redis is not available, use in-memory fallback
    if (!redisClient) {
      return checkInMemoryRateLimit(identifier, action, config);
    }

    const key = `ratelimit:${action}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Remove old entries
    await redisClient.zremrangebyscore(key, 0, windowStart);

    // Count current requests
    const count = await redisClient.zcard(key);

    if (count >= config.maxRequests) {
      const oldestRequest = (await redisClient.zrange(key, 0, 0, {
        withScores: true,
      })) as Array<{ score: number; member: string }>;
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
    // If Redis fails, use in-memory fallback instead of allowing all requests
    console.error('Rate limit check failed, using in-memory fallback:', error);
    return checkInMemoryRateLimit(identifier, action, config);
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
