import { Module } from '@nestjs/common';
import { EmailProcessor } from './email.processor';
import { DigestProcessor } from './digest.processor';
import { EmailController } from './email.controller';

@Module({
  controllers: [EmailController],
  providers: [EmailProcessor, DigestProcessor],
})
export class EmailModule {}
