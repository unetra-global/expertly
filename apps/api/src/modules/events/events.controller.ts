import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { EventsService } from './events.service';
import { QueryEventsDto } from './dto/query-events.dto';

@Controller('events')
@UseGuards(OptionalJwtGuard, RolesGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  getList(
    @Query() dto: QueryEventsDto,
  ): Promise<{ data: unknown[]; meta: unknown }> {
    return this.events.getList(dto);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string): Promise<unknown> {
    return this.events.getBySlug(slug);
  }
}
