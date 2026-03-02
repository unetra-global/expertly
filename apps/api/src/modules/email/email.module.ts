import { Module } from '@nestjs/common';
import { EmailProcessor } from './email.processor';

@Module({
  providers: [EmailProcessor],
})
export class EmailModule {}
