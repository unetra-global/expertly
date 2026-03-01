import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@expertly/types';
import { MembersService } from './members.service';
import { QueryMembersDto } from './dto/query-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { ServiceChangeDto } from './dto/service-change.dto';
import { AiSearchDto } from './dto/ai-search.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly members: MembersService) {}

  // ─── 1. GET /members/featured (Public) ────────────────────────────────────
  @Public()
  @Get('featured')
  getFeatured() {
    return this.members.getFeatured();
  }

  // ─── 2. GET /members/me (JWT + Member) ────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return this.members.getMe(user);
  }

  // ─── 3. GET /members/id/:id (JWT) ─────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('id/:id')
  getMemberById(@Param('id') id: string) {
    return this.members.getById(id);
  }

  // ─── 4. GET /members (OptionalJWT) ────────────────────────────────────────
  @UseGuards(OptionalJwtGuard)
  @Get()
  getList(
    @Query() dto: QueryMembersDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.members.getList(dto, user ?? null);
  }

  // ─── 5. GET /members/:slug (OptionalJWT) ──────────────────────────────────
  @UseGuards(OptionalJwtGuard)
  @Get(':slug')
  getMemberBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.members.getBySlug(slug, user ?? null);
  }

  // ─── PATCH /members/me (JWT + Member) ─────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  @Patch('me')
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.members.updateMe(user, dto);
  }

  // ─── PATCH /members/me/notifications (JWT + Member) ───────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  @Patch('me/notifications')
  updateNotifications(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateNotificationsDto,
  ) {
    return this.members.updateNotifications(user, dto);
  }

  // ─── POST /members/me/service-change (JWT + Member) ───────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  @Post('me/service-change')
  requestServiceChange(
    @CurrentUser() user: AuthUser,
    @Body() dto: ServiceChangeDto,
  ) {
    return this.members.requestServiceChange(user, dto.serviceId);
  }

  // ─── POST /members/search/ai (OptionalJWT) ────────────────────────────────
  @UseGuards(OptionalJwtGuard)
  @Post('search/ai')
  aiSearch(
    @Body() dto: AiSearchDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.members.aiSearch(dto, user ?? null);
  }
}
