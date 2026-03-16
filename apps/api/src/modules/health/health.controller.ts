import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SupabaseService } from '../../common/services/supabase.service';

interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  version: string;
  services: {
    database: 'ok' | 'error';
  };
}

@Controller('health')
export class HealthController {
  constructor(private readonly supabase: SupabaseService) {}

  @Public()
  @Get()
  async check(): Promise<HealthResponse> {
    const dbStatus = await this.checkDatabase();

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: dbStatus,
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
}
