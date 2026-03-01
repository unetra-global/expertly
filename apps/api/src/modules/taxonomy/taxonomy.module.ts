import { Module } from '@nestjs/common';
import { TaxonomyController } from './taxonomy.controller';
import { TaxonomyService } from './taxonomy.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { RedisService } from '../../common/services/redis.service';
import { CacheService } from '../../common/services/cache.service';

@Module({
  controllers: [TaxonomyController],
  providers: [TaxonomyService, SupabaseService, RedisService, CacheService],
})
export class TaxonomyModule {}
