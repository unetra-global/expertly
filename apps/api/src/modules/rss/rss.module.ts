import { Module } from '@nestjs/common';
import { RssProcessor } from './rss.processor';

@Module({
  providers: [RssProcessor],
  exports: [RssProcessor],
})
export class RssModule {}
