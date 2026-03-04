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
  async getStats() {
    const { data, error } = await this.supabase.adminClient.rpc(
      'get_ops_action_counts',
    );

    if (!error && data) return data;

    // Fallback to manual counts if RPC not available
    const [apps, members, articles, events] = await Promise.all([
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
    ]);

    return {
      totalApplications: apps.count ?? 0,
      totalMembers: members.count ?? 0,
      totalArticles: articles.count ?? 0,
      totalEvents: events.count ?? 0,
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
