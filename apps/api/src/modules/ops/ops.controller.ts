import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OpsService } from './ops.service';
import type { AuthUser } from '@expertly/types';

@Controller('ops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ops')
export class OpsController {
  constructor(private readonly ops: OpsService) {}

  // ── Applications ──────────────────────────────────────────────────────────

  @Get('applications')
  listApplications(
    @Query('status') status?: string,
    @Query('service') service?: string,
    @Query('country') country?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ops.listApplications({
      status,
      service,
      country,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('applications/:id')
  getApplication(@Param('id') id: string) {
    return this.ops.getApplication(id);
  }

  @Patch('applications/:id/approve')
  approveApplication(
    @Param('id') id: string,
    @Body() body: { serviceId: string; membershipTier: string },
  ) {
    return this.ops.approveApplication(id, body);
  }

  @Patch('applications/:id/reject')
  rejectApplication(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
  ) {
    return this.ops.rejectApplication(id, body);
  }

  @Patch('applications/:id/waitlist')
  waitlistApplication(@Param('id') id: string) {
    return this.ops.waitlistApplication(id);
  }

  // ── Members ───────────────────────────────────────────────────────────────

  @Get('members')
  listMembers(
    @Query('pendingReVerification') pendingReVerification?: string,
    @Query('pendingServiceChange') pendingServiceChange?: string,
    @Query('expiringDays') expiringDays?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ops.listMembers({
      pendingReVerification: pendingReVerification === 'true',
      pendingServiceChange: pendingServiceChange === 'true',
      expiringDays: expiringDays ? parseInt(expiringDays, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('members/:id')
  getMember(@Param('id') id: string) {
    return this.ops.getMember(id);
  }

  @Post('members/:id/activate')
  activateMember(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { paymentReceivedAt?: string; membershipExpiryAt?: string; paymentReceivedBy?: string },
  ) {
    return this.ops.activateMember(id, user, body);
  }

  @Patch('members/:id/verify')
  verifyMember(@Param('id') id: string) {
    return this.ops.verifyMember(id);
  }

  @Patch('members/:id/suspend')
  suspendMember(@Param('id') id: string) {
    return this.ops.suspendMember(id);
  }

  @Patch('members/:id/tier')
  updateMemberTier(
    @Param('id') id: string,
    @Body() body: { tier: string },
  ) {
    return this.ops.updateMemberTier(id, body);
  }

  @Patch('members/:id/featured')
  toggleFeatured(
    @Param('id') id: string,
    @Body() body: { isFeatured: boolean },
  ) {
    return this.ops.toggleFeatured(id, body);
  }

  @Patch('members/:id/credentials')
  verifyCredential(
    @Param('id') id: string,
    @Body() body: { credentialIndex: number; verified: boolean },
  ) {
    return this.ops.verifyCredential(id, body);
  }

  @Patch('members/:id/testimonials')
  verifyTestimonial(
    @Param('id') id: string,
    @Body() body: { testimonialIndex: number; verified: boolean },
  ) {
    return this.ops.verifyTestimonial(id, body);
  }

  @Patch('members/:id/approve-service-change')
  approveServiceChange(@Param('id') id: string) {
    return this.ops.approveServiceChange(id);
  }

  @Patch('members/:id/reject-service-change')
  rejectServiceChange(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
  ) {
    return this.ops.rejectServiceChange(id, body);
  }

  @Patch('members/:id/renew')
  renewMembership(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { paymentReceivedAt?: string; renewalPeriodYears?: number; paymentReceivedBy?: string },
  ) {
    return this.ops.renewMembership(id, user, body);
  }

  // ── Articles ──────────────────────────────────────────────────────────────

  @Get('articles')
  listArticles(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ops.listArticles({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch('articles/:id/approve')
  approveArticle(@Param('id') id: string) {
    return this.ops.approveArticle(id);
  }

  @Patch('articles/:id/reject')
  rejectArticle(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
  ) {
    return this.ops.rejectArticle(id, body);
  }

  @Patch('articles/:id/archive')
  archiveArticle(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.ops.archiveArticle(id, body);
  }

  // ── Seats ─────────────────────────────────────────────────────────────────

  @Get('seats')
  listSeats() {
    return this.ops.listSeats();
  }

  @Post('seats')
  createSeat(
    @Body()
    body: { categoryId?: string; serviceId?: string; capacity: number },
  ) {
    return this.ops.createSeat(body);
  }

  @Patch('seats/:id')
  updateSeat(
    @Param('id') id: string,
    @Body() body: { capacity?: number; isActive?: boolean },
  ) {
    return this.ops.updateSeat(id, body);
  }

  // ── Events (backend_admin only for create/delete) ─────────────────────────

  @Post('events')
  @Roles('backend_admin')
  createEvent(@Body() body: Record<string, unknown>) {
    return this.ops.createEvent(body);
  }

  @Patch('events/:id')
  updateEvent(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.ops.updateEvent(id, body);
  }

  @Delete('events/:id')
  @Roles('backend_admin')
  deleteEvent(@Param('id') id: string) {
    return this.ops.deleteEvent(id);
  }

  // ── Broadcast ─────────────────────────────────────────────────────────────

  @Post('broadcast')
  @Roles('backend_admin')
  broadcast(
    @Body() body: { subject: string; message: string; roles?: string[] },
  ) {
    return this.ops.broadcast(body);
  }

  @Get('broadcast-logs')
  getBroadcastLogs() {
    return this.ops.getBroadcastLogs();
  }
}
