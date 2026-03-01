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

    if (redisUrl) {
      this._client = new Redis(redisUrl, {
        tls: { rejectUnauthorized: false },
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          if (times >= 10) {
            this.logger.error('Redis max retries reached — giving up');
            return null;
          }
          return Math.min(times * 500, 2000);
        },
      });
    } else {
      const host = this.config.get<string>('REDIS_HOST', 'localhost');
      const port = this.config.get<number>('REDIS_PORT', 6379);
      const password = this.config.get<string>('REDIS_PASSWORD');

      this._client = new Redis({
        host,
        port,
        password: password || undefined,
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          if (times >= 10) {
            this.logger.error('Redis max retries reached — giving up');
            return null;
          }
          return Math.min(times * 500, 2000);
        },
      });
    }

    this._client.on('connect', () => this.logger.log('Redis connected'));
    this._client.on('error', (err: Error) =>
      this.logger.error('Redis error', err.message),
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this._client?.quit();
  }

  get client(): Redis {
    return this._client;
  }
}
