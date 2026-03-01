import { Global, Module } from '@nestjs/common';
import { CacheService } from '../services/cache.service';
import { EmailService } from '../services/email.service';

@Global()
@Module({
  providers: [CacheService, EmailService],
  exports: [CacheService, EmailService],
})
export class CacheModule {}
