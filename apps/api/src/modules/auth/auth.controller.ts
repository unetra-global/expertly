import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@expertly/types';
import { SupabaseService } from '../../common/services/supabase.service';

interface UserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

interface MemberRow {
  id: string;
  user_id: string;
  slug: string;
  headline: string;
  bio: string;
  profile_photo_url: string | null;
  avatar_url: string | null;
  designation: string;
  city: string;
  country: string;
  location: string | null;
  website: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  membership_status: string;
  member_tier: string;
  is_verified: boolean;
  is_featured: boolean;
  primary_service_id: string | null;
  years_of_experience: number | null;
  consultation_fee_min_usd: number | null;
  consultation_fee_max_usd: number | null;
  qualifications: string | null;
  availability: unknown;
  engagement: unknown;
  credentials: unknown[];
  testimonials: unknown[];
  work_experience: unknown[];
  education: unknown[];
  view_count: number;
  created_at: string;
  updated_at: string;
}

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly supabase: SupabaseService) {}

  @Post('sync')
  async sync(@CurrentUser() user: AuthUser): Promise<Record<string, unknown>> {
    // Update last_login_at
    await this.supabase.adminClient
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.dbId);

    const { data } = await this.supabase.adminClient
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('id', user.dbId)
      .single();

    const row = data as Pick<UserRow, 'id' | 'email' | 'first_name' | 'last_name' | 'role'> | null;

    return {
      id: row?.id,
      email: row?.email,
      first_name: row?.first_name,
      last_name: row?.last_name,
      role: row?.role,
      member_id: user.memberId ?? null,
    };
  }

  @Get('me')
  async me(@CurrentUser() user: AuthUser): Promise<Record<string, unknown>> {
    const { data: userData } = await this.supabase.adminClient
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, is_deleted, last_login_at, created_at, updated_at')
      .eq('id', user.dbId)
      .single();

    const result: Record<string, unknown> = { ...(userData as Record<string, unknown> | null ?? {}) };

    if (user.role === 'member' && user.memberId) {
      const { data: memberData } = await this.supabase.adminClient
        .from('members')
        .select(
          'id, user_id, slug, headline, bio, profile_photo_url, avatar_url, designation, ' +
          'city, country, location, website, linkedin_url, twitter_url, github_url, ' +
          'membership_status, member_tier, is_verified, is_featured, primary_service_id, ' +
          'years_of_experience, consultation_fee_min_usd, consultation_fee_max_usd, ' +
          'qualifications, availability, engagement, credentials, testimonials, ' +
          'work_experience, education, view_count, membership_start_date, ' +
          'membership_expiry_date, created_at, updated_at, ' +
          'services!primary_service_id(id, name, slug)',
        )
        .eq('id', user.memberId)
        .single();

      if (memberData) {
        result.member = memberData as unknown as MemberRow;
      }
    }

    return result;
  }

  @Post('logout')
  logout(): { message: string } {
    return { message: 'Logged out successfully' };
  }
}
