import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SupabaseService } from '../../common/services/supabase.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('backend_admin')
export class AdminController {
  constructor(private readonly supabase: SupabaseService) {}

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
  @Roles('ops')
  async getStats() {
    const { data, error } = await this.supabase.adminClient.rpc(
      'get_ops_action_counts',
    );

    if (!error && data) {
      // RPC returns a single-row result set; Supabase wraps it in an array
      const row = Array.isArray(data) ? data[0] : data;
      return {
        totalApplications: row.total_applications ?? 0,
        totalMembers: row.total_members ?? 0,
        totalArticles: row.total_articles ?? 0,
        totalEvents: row.total_events ?? 0,
        pendingApplications: row.pending_applications ?? 0,
        pendingArticles: row.pending_articles ?? 0,
        pendingReVerification: row.pending_re_verification ?? 0,
        expiringIn30Days: row.expiring_in_30_days ?? 0,
      };
    }

    // Fallback to manual counts if RPC not available
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
      this.supabase.adminClient
        .from('applications')
        .select('id', { count: 'exact', head: true }),
      this.supabase.adminClient
        .from('members')
        .select('id', { count: 'exact', head: true }),
      this.supabase.adminClient
        .from('articles')
        .select('id', { count: 'exact', head: true }),
      this.supabase.adminClient
        .from('events')
        .select('id', { count: 'exact', head: true }),
      this.supabase.adminClient
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .in('status', ['submitted', 'under_review']),
      this.supabase.adminClient
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'draft'),
      this.supabase.adminClient
        .from('members')
        .select('id', { count: 'exact', head: true })
        .not('re_verification_requested_at', 'is', null)
        .eq('membership_status', 'active'),
      this.supabase.adminClient
        .from('members')
        .select('id', { count: 'exact', head: true })
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

  // ── PATCH /admin/users/:id/role ────────────────────────────────────────────

  @Patch('users/:id/role')
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

  // ── DELETE /admin/users/:id ────────────────────────────────────────────────

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    // Soft delete / anonymise — never hard-delete user data
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
