import { Module } from '@nestjs/common';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { RedisService } from '../../common/services/redis.service';
import { CacheService } from '../../common/services/cache.service';

@Module({
  controllers: [HomepageController],
  providers: [HomepageService, SupabaseService, RedisService, CacheService],
})
export class HomepageModule {}
