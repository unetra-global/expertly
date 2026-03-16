import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@expertly/types';
import { SearchService } from './search.service';
import { AiSearchDto } from './dto/ai-search.dto';

@Controller('search')
@UseGuards(OptionalJwtGuard, RolesGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // Static routes BEFORE dynamic — no :param here but keeping order explicit

  @Post('ai')
  searchAI(
    @CurrentUser() user: AuthUser | null,
    @Body() dto: AiSearchDto,
  ) {
    return this.searchService.searchAI(dto.query, user, dto.scope);
  }

  @Get()
  globalSearch(
    @CurrentUser() user: AuthUser | null,
    @Query('q') q: string,
    @Query('type') type: 'all' | 'members' | 'articles' | 'events' = 'all',
  ) {
    return this.searchService.search(q ?? '', type, user);
  }
}
