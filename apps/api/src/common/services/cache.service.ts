import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

const DEFAULT_TTL = 300; // 5 minutes
const LOCK_TTL = 30;     // 30 seconds lock for stampede protection

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redis: RedisService) {}

  buildKey(namespace: string, ...parts: (string | number)[]): string {
    return `expertly:${namespace}:${parts.join(':')}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const val = await this.redis.client.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl = DEFAULT_TTL): Promise<void> {
    await this.redis.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.redis.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.redis.client.keys(pattern);
    if (keys.length > 0) {
      await this.redis.client.del(...keys);
      this.logger.debug(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
    }
  }

  /**
   * Get a value from cache, or fetch it if missing.
   * Uses a Redis lock to prevent cache stampede (thundering herd).
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = DEFAULT_TTL,
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    // Acquire lock
    const lockKey = `lock:${key}`;
    const lockToken = `${Date.now()}-${Math.random()}`;
    const acquired = await this.redis.client.set(lockKey, lockToken, 'EX', LOCK_TTL, 'NX');

    if (acquired === 'OK') {
      try {
        const value = await fetcher();
        await this.set(key, value, ttl);
        return value;
      } finally {
        // Release lock only if we own it
        const current = await this.redis.client.get(lockKey);
        if (current === lockToken) {
          await this.redis.client.del(lockKey);
        }
      }
    }

    // Another process holds lock — wait briefly and retry from cache
    await new Promise((resolve) => setTimeout(resolve, 200));
    const retried = await this.get<T>(key);
    if (retried !== null) return retried;

    // Fallback: fetch directly (lock may have been lost)
    return fetcher();
  }
}
