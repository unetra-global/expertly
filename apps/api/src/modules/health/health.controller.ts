import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SupabaseService } from '../../common/services/supabase.service';
import { RedisService } from '../../common/services/redis.service';

interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  version: string;
  services: {
    database: 'ok' | 'error';
    cache: 'ok' | 'error';
  };
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get()
  async check(): Promise<HealthResponse> {
    const [dbStatus, cacheStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkCache(),
    ]);

    const allOk = dbStatus === 'ok' && cacheStatus === 'ok';

    return {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: dbStatus,
        cache: cacheStatus,
      },
    };
  }

  private async checkDatabase(): Promise<'ok' | 'error'> {
    try {
      const { error } = await this.supabase.adminClient
        .from('users')
        .select('id')
        .limit(1);
      return error ? 'error' : 'ok';
    } catch {
      return 'error';
    }
  }

  private async checkCache(): Promise<'ok' | 'error'> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG' || result === 'DISABLED' ? 'ok' : 'error';
    } catch {
      return 'error';
    }
  }
}
