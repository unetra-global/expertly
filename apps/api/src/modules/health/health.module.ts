import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { SupabaseService } from '../../common/services/supabase.service';
import { RedisService } from '../../common/services/redis.service';

@Module({
  controllers: [HealthController],
  providers: [SupabaseService, RedisService],
})
export class HealthModule {}
