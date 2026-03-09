import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private _client: Redis | null = null;
  private readonly disabledByEnv = process.env['REDIS_DISABLED'] === 'true';
  private unavailable = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    if (this.disabledByEnv) {
      this.logger.warn('REDIS_DISABLED=true. Redis is disabled and the API will run in no-cache mode.');
      return;
    }

    const redisUrl = this.config.get<string>('REDIS_URL');

    const sharedOptions = {
      // Never permanently close — always reconnect with capped backoff
      retryStrategy: (times: number): number => {
        const delay = Math.min(times * 300, 5000);
        if (times % 10 === 0) {
          this.logger.warn(`Redis reconnecting… attempt ${times}`);
        }
        return delay;
      },
      // Per-command retry: fail fast so requests don't hang indefinitely
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      connectTimeout: 10000,
    };

    if (redisUrl) {
      this._client = new Redis(redisUrl, {
        ...sharedOptions,
        tls: { rejectUnauthorized: false },
      });
    } else {
      const host = this.config.get<string>('REDIS_HOST', 'localhost');
      const port = this.config.get<number>('REDIS_PORT', 6379);
      const password = this.config.get<string>('REDIS_PASSWORD');
      const redisTls = this.config.get<string>('REDIS_TLS');

      this._client = new Redis({
        ...sharedOptions,
        host,
        port,
        password: password || undefined,
        ...(redisTls === 'true' ? { tls: { rejectUnauthorized: false } } : {}),
      });
    }

    this._client.on('connect', () => this.logger.log('Redis connected'));
    this._client.on('ready', () => this.logger.log('Redis ready'));
    this._client.on('error', (err: Error) => {
      this.logger.error('Redis error', err.message);
      if (this.isMaxRequestsLimitError(err)) {
        this.markUnavailable('Upstash max requests limit exceeded', err);
      }
    });
    this._client.on('close', () => this.logger.warn('Redis connection closed'));
  }

  async onModuleDestroy(): Promise<void> {
    await this._client?.quit();
  }

  get client(): Redis {
    if (!this._client) {
      throw new Error('Redis client is not available');
    }
    return this._client;
  }

  async get(key: string): Promise<string | null> {
    return this.run('GET', null, () => this.client.get(key));
  }

  async set(key: string, value: string, ...args: Array<string | number>): Promise<string | null> {
    return this.run('SET', null, async () => {
      const redis = this.client as unknown as {
        set: (k: string, v: string, ...a: Array<string | number>) => Promise<string | null>;
      };
      return redis.set(key, value, ...args);
    });
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return this.run('DEL', 0, () => this.client.del(...keys));
  }

  async keys(pattern: string): Promise<string[]> {
    return this.run('KEYS', [], () => this.client.keys(pattern));
  }

  async incr(key: string): Promise<number> {
    return this.run('INCR', 0, () => this.client.incr(key));
  }

  async ping(): Promise<string> {
    const fallback = this.disabledByEnv || this.unavailable ? 'DISABLED' : 'ERROR';
    return this.run('PING', fallback, () => this.client.ping());
  }

  isDisabled(): boolean {
    return this.disabledByEnv || this.unavailable;
  }

  private async run<T>(op: string, fallback: T, fn: () => Promise<T>): Promise<T> {
    if (this.disabledByEnv || this.unavailable || !this._client) {
      return fallback;
    }

    try {
      return await fn();
    } catch (error) {
      if (this.isMaxRequestsLimitError(error)) {
        this.markUnavailable('Upstash max requests limit exceeded', error);
        return fallback;
      }

      this.logger.warn(`Redis ${op} failed. Falling back. ${this.errorText(error)}`);
      return fallback;
    }
  }

  private markUnavailable(reason: string, error?: unknown): void {
    if (this.unavailable) return;
    this.unavailable = true;
    this.logger.warn(`${reason}. Redis disabled for this process; continuing in no-cache mode.`);
    if (error) {
      this.logger.warn(`Redis disable trigger: ${this.errorText(error)}`);
    }
  }

  private isMaxRequestsLimitError(error: unknown): boolean {
    const text = this.errorText(error).toLowerCase();
    if (text.includes('max requests limit exceeded')) return true;

    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = String((error as { code?: unknown }).code ?? '').toLowerCase();
      if (code.includes('max_requests_limit_exceeded')) return true;
    }

    return false;
  }

  private errorText(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
      const msg = (error as { message?: unknown }).message;
      if (typeof msg === 'string') return msg;
    }
    return 'unknown redis error';
  }
}
