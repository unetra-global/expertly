import { Injectable } from '@nestjs/common';

/**
 * CacheService — passthrough implementation.
 * Redis is reserved exclusively for BullMQ. All API responses hit Supabase
 * directly; Next.js ISR handles public-page caching at the edge.
 */
@Injectable()
export class CacheService {
  buildKey(namespace: string, ...parts: (string | number)[]): string {
    return `expertly:${namespace}:${parts.join(':')}`;
  }

  async get<T>(_key: string): Promise<T | null> {
    return null;
  }

  async set<T>(_key: string, _value: T, _ttl?: number): Promise<void> {
    // no-op
  }

  async del(_key: string): Promise<void> {
    // no-op
  }

  async delByPattern(_pattern: string): Promise<void> {
    // no-op
  }

  async getOrFetch<T>(_key: string, fetcher: () => Promise<T>, _ttl?: number): Promise<T> {
    return fetcher();
  }
}
