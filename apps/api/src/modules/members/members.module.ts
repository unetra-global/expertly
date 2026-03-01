import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { RedisService } from '../../common/services/redis.service';
import { CacheService } from '../../common/services/cache.service';

@Module({
  controllers: [MembersController],
  providers: [MembersService, SupabaseService, RedisService, CacheService],
})
export class MembersModule {}
