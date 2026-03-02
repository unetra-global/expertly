import { Module } from '@nestjs/common';
import { EmailProcessor } from './email.processor';
import { DigestProcessor } from './digest.processor';

@Module({
  providers: [EmailProcessor, DigestProcessor],
})
export class EmailModule {}
