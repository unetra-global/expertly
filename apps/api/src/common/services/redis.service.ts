import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private _client!: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const host = this.config.get<string>('REDIS_HOST', 'localhost');
    const port = this.config.get<number>('REDIS_PORT', 6379);
    const password = this.config.get<string>('REDIS_PASSWORD');
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    const redisTls = this.config.get<string>('REDIS_TLS') === 'true';

    this._client = new Redis({
      host,
      port,
      password: password || undefined,
      tls: isProd || redisTls ? {} : undefined,
      retryStrategy: (times: number) => {
        if (times >= 10) {
          this.logger.error('Redis max retries reached — giving up');
          return null;
        }
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this._client.on('connect', () => this.logger.log('Redis connected'));
    this._client.on('error', (err: Error) => this.logger.error('Redis error', err.message));
  }

  async onModuleDestroy(): Promise<void> {
    await this._client.quit();
  }

  get client(): Redis {
    return this._client;
  }
}
