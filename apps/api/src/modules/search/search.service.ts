import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SupabaseService } from '../../common/services/supabase.service';
import { AuthUser } from '@expertly/types';

const MEMBER_TEASER_FIELDS =
  'id, slug, designation, headline, profile_photo_url, avatar_url, ' +
  'city, country, member_tier, is_verified, primary_service_id, ' +
  'users!user_id(first_name, last_name), ' +
  'services!primary_service_id(name)';

const ARTICLE_LIST_FIELDS =
  'id, title, slug, excerpt, cover_image_url, tags, read_time, published_at';

const EVENT_LIST_FIELDS =
  'id, title, slug, description, cover_image_url, start_date, end_date, ' +
  'location, is_virtual, status';

type SearchType = 'all' | 'members' | 'articles' | 'events';

@Injectable()
export class SearchService {
  private openai: OpenAI | null = null;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async search(
    q: string,
    type: SearchType = 'all',
    user: AuthUser | null,
  ): Promise<{ members: unknown[]; articles: unknown[]; events: unknown[] }> {
    if (!this.openai) {
      throw new BadRequestException('Search not configured');
    }

    // Generate single embedding for the query
    const embeddingResp = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: q,
    });
    const embedding = embeddingResp.data[0]?.embedding;
    if (!embedding) {
      return { members: [], articles: [], events: [] };
    }

    const shouldSearchMembers = type === 'all' || type === 'members';
    const shouldSearchArticles = type === 'all' || type === 'articles';
    const shouldSearchEvents = type === 'all' || type === 'events';

    // Run parallel RPC calls
    const [membersResult, articlesResult, eventsResult] = await Promise.all([
      shouldSearchMembers
        ? this.supabase.adminClient.rpc('search_members', {
            query_embedding: embedding,
            similarity_threshold: 0.6,
            match_count: 10,
          })
        : Promise.resolve({ data: null, error: null }),

      shouldSearchArticles
        ? this.supabase.adminClient.rpc('search_articles', {
            query_embedding: embedding,
            similarity_threshold: 0.6,
            match_count: 10,
          })
        : Promise.resolve({ data: null, error: null }),

      shouldSearchEvents
        ? this.supabase.adminClient.rpc('search_events', {
            query_embedding: embedding,
            similarity_threshold: 0.6,
            match_count: 10,
          })
        : Promise.resolve({ data: null, error: null }),
    ]);

    // Fetch member details (teaser only for guests)
    let members: unknown[] = [];
    if (membersResult.data && (membersResult.data as unknown[]).length > 0) {
      const ids = (membersResult.data as Array<{ id: string }>).map((r) => r.id);
      const { data } = await this.supabase.adminClient
        .from('members')
        .select(MEMBER_TEASER_FIELDS)
        .in('id', ids)
        .eq('membership_status', 'active');
      members = data ?? [];
    }

    // Fetch article details
    let articles: unknown[] = [];
    if (articlesResult.data && (articlesResult.data as unknown[]).length > 0) {
      const ids = (articlesResult.data as Array<{ id: string }>).map((r) => r.id);
      const { data } = await this.supabase.adminClient
        .from('articles')
        .select(ARTICLE_LIST_FIELDS)
        .in('id', ids)
        .eq('status', 'published');
      articles = data ?? [];
    }

    // Fetch event details
    let events: unknown[] = [];
    if (eventsResult.data && (eventsResult.data as unknown[]).length > 0) {
      const ids = (eventsResult.data as Array<{ id: string }>).map((r) => r.id);
      const { data } = await this.supabase.adminClient
        .from('events')
        .select(EVENT_LIST_FIELDS)
        .in('id', ids)
        .eq('status', 'published');
      events = data ?? [];
    }

    return { members, articles, events };
  }
}
