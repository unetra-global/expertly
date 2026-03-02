import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { LinkedInProcessor } from './linkedin.processor';

@Module({
  controllers: [AutomationController],
  providers: [LinkedInProcessor],
})
export class AutomationModule {}
