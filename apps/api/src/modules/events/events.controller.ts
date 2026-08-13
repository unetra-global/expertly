import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { EventsService } from './events.service';
import { QueryEventsDto } from './dto/query-events.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @UseGuards(OptionalJwtGuard, RolesGuard)
  @Get()
  getList(@Query() dto: QueryEventsDto): Promise<{ data: unknown[]; meta: unknown }> {
    return this.events.getList(dto);
  }

  @UseGuards(OptionalJwtGuard, RolesGuard)
  @Get(':slug')
  getBySlug(@Param('slug') slug: string): Promise<unknown> {
    return this.events.getBySlug(slug);
  }

  // ── Ops ───────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Get('admin/list')
  listOpsEvents() {
    return this.events.listOpsEvents();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Post('admin/import')
  async importEvents(@Req() req: FastifyRequest) {
    if (!req.isMultipart()) throw new BadRequestException('Request must be multipart/form-data');
    const data = await req.file();
    if (!data) throw new BadRequestException('No file uploaded');
    const file = data as unknown as { filename: string; toBuffer: () => Promise<Buffer> };
    return this.events.importEvents(await file.toBuffer(), file.filename);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Post('admin')
  createEvent(@Body() body: Record<string, unknown>) {
    return this.events.createEvent(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Patch('admin/:id/publish')
  publishEvent(@Param('id') id: string, @Body() body: { isPublished: boolean }) {
    return this.events.publishEvent(id, body.isPublished);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Patch('admin/:id')
  updateEvent(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.events.updateEvent(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Delete('admin/:id')
  deleteEvent(@Param('id') id: string) {
    return this.events.deleteEvent(id);
  }
}
