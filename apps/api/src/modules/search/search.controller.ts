import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@expertly/types';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(OptionalJwtGuard, RolesGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  globalSearch(
    @CurrentUser() user: AuthUser | null,
    @Query('q') q: string,
    @Query('type') type: 'all' | 'members' | 'articles' | 'events' = 'all',
  ): Promise<{ members: unknown[]; articles: unknown[]; events: unknown[] }> {
    return this.searchService.search(q ?? '', type, user);
  }
}
