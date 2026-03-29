import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { CacheService } from '../../common/services/cache.service';

const HOMEPAGE_TTL = 300; // 5 minutes

const FEATURED_MEMBER_FIELDS =
  'id, slug, designation, headline, profile_photo_url, avatar_url, ' +
  'city, country, member_tier, is_verified, primary_service_id, ' +
  'users!user_id(first_name, last_name), ' +
  'services!primary_service_id(name)';

const ARTICLE_FIELDS =
  'id, title, slug, excerpt, cover_image_url, tags, read_time, published_at, author_id, ' +
  'author:members!author_id(id, slug, designation, city, country, profile_photo_url, user:users!user_id(first_name, last_name)), ' +
  'category:categories!category_id(id, name)';

const EVENT_FIELDS =
  'id, title, slug, description, cover_image_url, start_date, end_date, ' +
  'location, is_virtual, event_format, city, country, status';

interface HomepageData {
  featuredMembers: unknown[];
  latestArticles: unknown[];
  upcomingEvents: unknown[];
}

@Injectable()
export class HomepageService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly cache: CacheService,
  ) {}

  async getHomepageData(): Promise<HomepageData> {
    const key = this.cache.buildKey('homepage', 'data');

    return this.cache.getOrFetch<HomepageData>(
      key,
      async () => {
        const [featuredResult, articlesResult, eventsResult] = await Promise.all([
          this.supabase.adminClient
            .from('members')
            .select(FEATURED_MEMBER_FIELDS)
            .eq('is_featured', true)
            .eq('membership_status', 'active')
            .limit(6),

          this.supabase.adminClient
            .from('articles')
            .select(ARTICLE_FIELDS)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(6),

          this.supabase.adminClient
            .from('events')
            .select(EVENT_FIELDS)
            .or('is_published.eq.true,status.eq.published')
            .gt('start_date', new Date().toISOString())
            .order('start_date', { ascending: true })
            .limit(4),
        ]);

        return {
          featuredMembers: featuredResult.data ?? [],
          latestArticles: articlesResult.data ?? [],
          upcomingEvents: eventsResult.data ?? [],
        };
      },
      HOMEPAGE_TTL,
    );
  }
}
