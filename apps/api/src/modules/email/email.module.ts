import { Module } from '@nestjs/common';
import { EmailProcessor } from './email.processor';
import { EmailController } from './email.controller';

@Module({
  controllers: [EmailController],
  providers: [EmailProcessor],
})
export class EmailModule {}
