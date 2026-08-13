import {
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
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
import { UpdateDigestsDto } from './dto/update-digests.dto';
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

  // ─── GET /members/me/digests (JWT — any logged-in user) ───────────────────
  // Intentionally no RolesGuard — works for user, member, ops roles.
  @UseGuards(JwtAuthGuard)
  @Get('me/digests')
  getDigests(@CurrentUser() user: AuthUser) {
    return this.members.getDigests(user);
  }

  // ─── PATCH /members/me/digests (JWT — any logged-in user) ─────────────────
  @UseGuards(JwtAuthGuard)
  @Patch('me/digests')
  @HttpCode(200)
  updateDigests(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateDigestsDto,
  ) {
    return this.members.updateDigests(user, dto);
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

  // ── Ops ───────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Post('admin/expire-overdue')
  expireOverdue() {
    return this.members.expireOverdueMemberships();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Post('admin/send-renewal-reminders')
  sendRenewalReminders(@Body() body: { daysUntilExpiry?: number }) {
    return this.members.sendRenewalReminders(body.daysUntilExpiry);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Get('admin/list')
  listOpsMembers(
    @Query('pendingReVerification') pendingReVerification?: string,
    @Query('pendingServiceChange') pendingServiceChange?: string,
    @Query('expiringDays') expiringDays?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.members.listOpsMembers({
      pendingReVerification: pendingReVerification === 'true',
      pendingServiceChange: pendingServiceChange === 'true',
      expiringDays: expiringDays ? parseInt(expiringDays, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Get('admin/:id')
  getOpsMember(@Param('id') id: string) {
    return this.members.getOpsMember(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Post('admin/:id/activate')
  activateMember(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { paymentReceivedAt?: string; membershipExpiryAt?: string; paymentReceivedBy?: string },
  ) {
    return this.members.activateMember(id, user, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Patch('admin/:id/verify')
  verifyMember(@Param('id') id: string) {
    return this.members.verifyMember(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Patch('admin/:id/suspend')
  suspendMember(@Param('id') id: string) {
    return this.members.suspendMember(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Patch('admin/:id/tier')
  updateMemberTier(@Param('id') id: string, @Body() body: { tier: string }) {
    return this.members.updateMemberTier(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Patch('admin/:id/featured')
  toggleFeatured(@Param('id') id: string, @Body() body: { isFeatured: boolean }) {
    return this.members.toggleFeatured(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Post('admin/:id/credential')
  addCredential(
    @Param('id') id: string,
    @Body() body: { name: string; issuingBody?: string; year?: number; url?: string; isVerified?: boolean },
  ) {
    return this.members.addCredential(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Patch('admin/:id/credentials')
  verifyCredential(@Param('id') id: string, @Body() body: { credentialIndex: number; verified: boolean }) {
    return this.members.verifyCredential(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Patch('admin/:id/testimonials')
  verifyTestimonial(@Param('id') id: string, @Body() body: { testimonialIndex: number; verified: boolean }) {
    return this.members.verifyTestimonial(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Patch('admin/:id/approve-service-change')
  approveServiceChange(@Param('id') id: string) {
    return this.members.approveServiceChange(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Patch('admin/:id/reject-service-change')
  rejectServiceChange(@Param('id') id: string, @Body() body: { rejectionReason: string }) {
    return this.members.rejectServiceChange(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  @Patch('admin/:id/renew')
  renewMembership(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { paymentReceivedAt?: string; renewalPeriodYears?: number; paymentReceivedBy?: string; membershipExpiryAt?: string },
  ) {
    return this.members.renewMembership(id, user, body);
  }
}
