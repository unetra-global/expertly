import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AiQueryParserService } from './ai-query-parser.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, AiQueryParserService],
})
export class SearchModule {}
