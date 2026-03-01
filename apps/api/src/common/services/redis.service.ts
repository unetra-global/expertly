import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private _client!: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
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
    this._client.on('error', (err: Error) =>
      this.logger.error('Redis error', err.message),
    );
    this._client.on('close', () => this.logger.warn('Redis connection closed'));
  }

  async onModuleDestroy(): Promise<void> {
    await this._client?.quit();
  }

  get client(): Redis {
    return this._client;
  }
}
