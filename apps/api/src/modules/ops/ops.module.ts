import { Module } from '@nestjs/common';
import { OpsController } from './ops.controller';
import { OpsService } from './ops.service';
import { RssModule } from '../rss/rss.module';

@Module({
  imports: [RssModule],
  controllers: [OpsController],
  providers: [OpsService],
})
export class OpsModule {}
