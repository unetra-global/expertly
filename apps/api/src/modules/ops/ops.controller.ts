import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { OpsService } from './ops.service';
import { SupabaseService } from '../../common/services/supabase.service';

@Controller('ops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ops', 'backend_admin')
export class OpsController {
  constructor(private readonly ops: OpsService) { }

  // ── Ops Users ─────────────────────────────────────────────────────────────

  @Get('users')
  listUsers() {
    return this.ops.listOpsUsers();
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

// ─────────────────────────────────────────────────────────────────────────────
// Admin controller — /admin/* routes
// Both ops and backend_admin can read; write operations are backend_admin only.
// ─────────────────────────────────────────────────────────────────────────────

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ops', 'backend_admin')
export class AdminController {
  constructor(private readonly supabase: SupabaseService) { }

  // ── GET /admin/users ───────────────────────────────────────────────────────

  @Get('users')
  async listUsers() {
    const { data, error } = await this.supabase.adminClient
      .from('users')
      .select('id, email, role, is_active, is_deleted, created_at')
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  // ── GET /admin/stats ───────────────────────────────────────────────────────

  @Get('stats')
  async getStats() {
    const sb = this.supabase.adminClient;
    const now = new Date().toISOString();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      totalApps,
      totalMembers,
      totalArticles,
      totalEvents,
      pendingApps,
      pendingArticles,
      pendingReVerification,
      expiringIn30Days,
    ] = await Promise.all([
      sb.from('applications').select('id', { count: 'exact', head: true }),
      sb.from('members').select('id', { count: 'exact', head: true }),
      sb.from('articles').select('id', { count: 'exact', head: true }),
      sb.from('events').select('id', { count: 'exact', head: true }),
      sb.from('applications').select('id', { count: 'exact', head: true })
        .in('status', ['submitted', 'under_review']),
      sb.from('articles').select('id', { count: 'exact', head: true })
        .eq('status', 'draft'),
      sb.from('members').select('id', { count: 'exact', head: true })
        .not('re_verification_requested_at', 'is', null)
        .eq('membership_status', 'active'),
      sb.from('members').select('id', { count: 'exact', head: true })
        .gte('membership_expiry_date', now)
        .lte('membership_expiry_date', in30Days)
        .eq('membership_status', 'active'),
    ]);

    return {
      totalApplications: totalApps.count ?? 0,
      totalMembers: totalMembers.count ?? 0,
      totalArticles: totalArticles.count ?? 0,
      totalEvents: totalEvents.count ?? 0,
      pendingApplications: pendingApps.count ?? 0,
      pendingArticles: pendingArticles.count ?? 0,
      pendingReVerification: pendingReVerification.count ?? 0,
      expiringIn30Days: expiringIn30Days.count ?? 0,
    };
  }

  // ── PATCH /admin/users/:id/role — backend_admin only ──────────────────────

  @Patch('users/:id/role')
  @Roles('backend_admin')
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: string },
  ) {
    const validRoles = ['user', 'member', 'ops', 'backend_admin'];
    if (!validRoles.includes(body.role)) {
      throw new BadRequestException(`Invalid role: ${body.role}`);
    }

    const { data, error } = await this.supabase.adminClient
      .from('users')
      .update({ role: body.role })
      .eq('id', id)
      .select('id, email, role')
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ── DELETE /admin/users/:id — backend_admin only ──────────────────────────

  @Delete('users/:id')
  @Roles('backend_admin')
  async deleteUser(@Param('id') id: string) {
    const { error } = await this.supabase.adminClient
      .from('users')
      .update({
        is_deleted: true,
        is_active: false,
        email: `deleted_${id}@anonymised.local`,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { message: 'User anonymised and deactivated' };
  }
}
