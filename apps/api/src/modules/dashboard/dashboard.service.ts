import { ForbiddenException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { AuthUser } from '@expertly/types';

const ME_FIELDS =
  'id, slug, headline, bio, designation, profile_photo_url, avatar_url, ' +
  'city, country, website, linkedin_url, twitter_url, github_url, ' +
  'primary_service_id, years_of_experience, qualifications, ' +
  'consultation_fee_min_usd, consultation_fee_max_usd, ' +
  'credentials, work_experience, education, testimonials, ' +
  'is_verified, is_featured, membership_expiry_date';

@Injectable()
export class DashboardService {
  constructor(private readonly supabase: SupabaseService) {}

  async getStats(user: AuthUser): Promise<unknown> {
    if (!user.memberId) throw new ForbiddenException('Member access required');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Run all queries in parallel
    const [memberResult, articleStatsResult, consultationCountResult, recentConsultationsResult, recentArticlesResult] =
      await Promise.all([
        // Member profile for completion calculation
        this.supabase.adminClient
          .from('members')
          .select(ME_FIELDS)
          .eq('id', user.memberId)
          .single(),

        // Article stats
        this.supabase.adminClient
          .from('articles')
          .select('id, status, view_count', { count: 'exact' })
          .eq('author_id', user.memberId),

        // Consultation requests in last 30 days
        this.supabase.adminClient
          .from('consultation_requests')
          .select('id', { count: 'exact', head: true })
          .eq('member_id', user.memberId)
          .gte('created_at', thirtyDaysAgo),

        // Recent consultation requests
        this.supabase.adminClient
          .from('consultation_requests')
          .select('id, user_id, subject, status, created_at')
          .eq('member_id', user.memberId)
          .order('created_at', { ascending: false })
          .limit(3),

        // Recent articles
        this.supabase.adminClient
          .from('articles')
          .select('id, title, slug, status, word_count, read_time, published_at, created_at')
          .eq('author_id', user.memberId)
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

    const member = memberResult.data as Record<string, unknown> | null;
    const articles = (articleStatsResult.data ?? []) as Array<{
      id: string;
      status: string;
      view_count?: number;
    }>;

    // Calculate profile completion
    const profileCompletion = member ? this.calculateProfileCompletion(member) : 0;

    const publishedArticles = articles.filter((a) => a.status === 'published');
    const publishedCount = publishedArticles.length;
    const totalViews = publishedArticles.reduce((sum, a) => sum + (a.view_count ?? 0), 0);

    return {
      profileCompletion,
      publishedArticlesCount: publishedCount,
      totalArticleViews: totalViews,
      consultationRequestsLast30Days: consultationCountResult.count ?? 0,
      membershipExpiryDate: member?.membership_expiry_date ?? null,
      isVerified: member?.is_verified ?? false,
      recentConsultationRequests: recentConsultationsResult.data ?? [],
      recentArticles: recentArticlesResult.data ?? [],
    };
  }

  private calculateProfileCompletion(member: Record<string, unknown>): number {
    const fields: Array<keyof typeof member> = [
      'slug',
      'headline',
      'bio',
      'designation',
      'profile_photo_url',
      'city',
      'country',
      'primary_service_id',
      'years_of_experience',
      'consultation_fee_min_usd',
      'linkedin_url',
      'qualifications',
    ];

    const jsonbFields: Array<keyof typeof member> = [
      'credentials',
      'work_experience',
      'education',
    ];

    let score = 0;
    const total = fields.length + jsonbFields.length;

    for (const f of fields) {
      if (member[f] !== null && member[f] !== undefined && member[f] !== '') {
        score++;
      }
    }

    for (const f of jsonbFields) {
      const val = member[f];
      if (Array.isArray(val) && val.length > 0) {
        score++;
      } else if (val !== null && val !== undefined && typeof val === 'object') {
        if (Object.keys(val as object).length > 0) score++;
      }
    }

    return Math.round((score / total) * 100);
  }
}
