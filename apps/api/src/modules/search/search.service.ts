import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmbeddingService } from '../../common/services/embedding.service';
import { AuthUser } from '@expertly/types';
import { resolveCountryName } from '@expertly/utils';
import { AiQueryParserService, type ParsedQuery } from './ai-query-parser.service';

// ── Field selects ────────────────────────────────────────────────────────────

const MEMBER_TEASER_FIELDS =
  'id, slug, designation, headline, profile_photo_url, ' +
  'city, country, member_tier, is_verified, primary_service_id, ' +
  'users!user_id(first_name, last_name), ' +
  'services!primary_service_id(name)';

const ARTICLE_LIST_FIELDS =
  'id, title, slug, excerpt, cover_image_url, tags, read_time, published_at';

const EVENT_LIST_FIELDS =
  'id, title, slug, description, cover_image_url, start_date, end_date, ' +
  'location, is_virtual, status, city, country';

type SearchType = 'all' | 'members' | 'articles' | 'events';

export interface SearchResults {
  members: unknown[];
  articles: unknown[];
  events: unknown[];
  parsedQuery?: ParsedQuery;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
    private readonly queryParser: AiQueryParserService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  // ── Basic vector search (existing GET /search) ─────────────────────────────

  async search(
    q: string,
    type: SearchType = 'all',
    _user: AuthUser | null,
  ): Promise<{ members: unknown[]; articles: unknown[]; events: unknown[] }> {
    if (!this.embeddingService.isAvailable()) {
      throw new BadRequestException('Search not configured: embedding provider missing');
    }

    const embedding = await this.embeddingService.embed(q);
    if (!embedding) return { members: [], articles: [], events: [] };

    return this.runVectorSearch(embedding, type, {});
  }

  // ── AI natural-language search (POST /search/ai) ───────────────────────────

  async searchAI(
    query: string,
    user: AuthUser | null,
    scope?: 'members' | 'articles' | 'events' | 'all',
  ): Promise<SearchResults> {
    // 1. Parse natural language → structured intent + filters
    const parsed = await this.queryParser.parse(query);
    this.logger.debug(`AI search parsed: ${JSON.stringify(parsed)}`);

    // 2. Scope overrides the LLM's intent when caller specifies a page context
    const intent = scope && scope !== 'all' ? scope : parsed.intent;

    // 3. Generate embedding for the clean semantic query
    const embedding = await this.embeddingService.embed(parsed.cleanQuery);
    if (!embedding) {
      return { members: [], articles: [], events: [], parsedQuery: { ...parsed, intent } };
    }

    // 4. Run vector search + apply extracted filters
    const results = await this.runVectorSearch(embedding, intent, parsed.filters);

    return { ...results, parsedQuery: { ...parsed, intent } };
  }


  private async runVectorSearch(
    embedding: number[],
    type: SearchType,
    filters: ParsedQuery['filters'],
  ): Promise<{ members: unknown[]; articles: unknown[]; events: unknown[] }> {
    const shouldSearchMembers = type === 'all' || type === 'members';
    const shouldSearchArticles = type === 'all' || type === 'articles';
    const shouldSearchEvents = type === 'all' || type === 'events';

    // NOTE: Do NOT pass filter_country to the RPC.
    // The DB stores ISO-2 codes (IN, GB, AE…) but the LLM returns full names
    // ("India", "United Kingdom"). Country filtering is applied post-RPC via
    // countryToIso() so the cast is consistent.
    const [membersResult, articlesResult, eventsResult] = await Promise.all([
      shouldSearchMembers
        ? this.supabase.adminClient.rpc('search_members', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 20,
          })
        : Promise.resolve({ data: null, error: null }),

      shouldSearchArticles
        ? this.supabase.adminClient.rpc('search_articles', {
            query_embedding: embedding,
            match_threshold: 0.4,
            match_count: 15,
          })
        : Promise.resolve({ data: null, error: null }),

      shouldSearchEvents
        ? this.supabase.adminClient.rpc('search_events', {
            query_embedding: embedding,
            match_threshold: 0.3,
            match_count: 20,
          })
        : Promise.resolve({ data: null, error: null }),
    ]);

    const members = await this.fetchMemberDetails(
      membersResult.data as Array<{ id: string; similarity: number }> | null,
      filters,
    );

    const articles = await this.fetchArticleDetails(
      articlesResult.data as Array<{ id: string; similarity: number }> | null,
    );

    const events = await this.fetchEventDetails(
      eventsResult.data as Array<{ id: string; similarity: number }> | null,
      filters,
    );

    return { members, articles, events };
  }

  private async fetchMemberDetails(
    rpcData: Array<{ id: string; similarity: number }> | null,
    filters: ParsedQuery['filters'],
  ): Promise<unknown[]> {
    if (!rpcData || rpcData.length === 0) return [];

    const ids = rpcData.map((r) => r.id);
    const simMap = new Map(rpcData.map((r) => [r.id, r.similarity]));

    let query = this.supabase.adminClient
      .from('members')
      .select(MEMBER_TEASER_FIELDS)
      .in('id', ids)
      .eq('membership_status', 'active');

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    // Country stored as canonical name (country_enum) — try single country, then continent/region
    if (filters.country) {
      const canonical = resolveCountry(filters.country);
      if (canonical) {
        query = query.eq('country', canonical);
      } else {
        const names = continentToCountryNames(filters.country);
        if (names) query = query.in('country', names);
      }
    }

    const { data, error } = await query;
    if (error) this.logger.error('fetchMemberDetails error', error);
    this.logger.debug(
      `fetchMemberDetails: rpc=${rpcData.length} ids, country_filter=${filters.country ?? 'none'}, after_filter=${(data ?? []).length}`,
    );

    // Re-sort by similarity — .in() does not preserve RPC order
    return (data ?? []).sort(
      (a, b) =>
        (simMap.get((b as unknown as Record<string, unknown>).id as string) ?? 0) -
        (simMap.get((a as unknown as Record<string, unknown>).id as string) ?? 0),
    );
  }

  private async fetchArticleDetails(
    rpcData: Array<{ id: string; similarity: number }> | null,
  ): Promise<unknown[]> {
    if (!rpcData || rpcData.length === 0) return [];

    const ids = rpcData.map((r) => r.id);
    const simMap = new Map(rpcData.map((r) => [r.id, r.similarity]));

    const { data, error } = await this.supabase.adminClient
      .from('articles')
      .select(ARTICLE_LIST_FIELDS)
      .in('id', ids)
      .eq('status', 'published');

    if (error) this.logger.error('fetchArticleDetails error', error);

    return (data ?? []).sort(
      (a, b) =>
        (simMap.get((b as unknown as Record<string, unknown>).id as string) ?? 0) -
        (simMap.get((a as unknown as Record<string, unknown>).id as string) ?? 0),
    );
  }

  private async fetchEventDetails(
    rpcData: Array<{ id: string; similarity: number }> | null,
    filters: ParsedQuery['filters'],
  ): Promise<unknown[]> {
    if (!rpcData || rpcData.length === 0) return [];

    const ids = rpcData.map((r) => r.id);
    const simMap = new Map(rpcData.map((r) => [r.id, r.similarity]));

    let query = this.supabase.adminClient
      .from('events')
      .select(EVENT_LIST_FIELDS)
      .in('id', ids)
      .eq('status', 'published');

    // Apply date range filter
    if (filters.dateFrom) {
      query = query.gte('start_date', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('start_date', filters.dateTo);
    }

    // Apply online/virtual filter
    if (filters.isVirtual === true) {
      query = query.eq('is_virtual', true);
    }

    // Apply city filter (location is a text field — use ilike)
    if (filters.city) {
      query = query.or(
        `city.ilike.%${filters.city}%,location.ilike.%${filters.city}%`,
      );
    }

    // Country stored as canonical name (country_enum) — try single country, then continent/region
    if (filters.country) {
      const canonical = resolveCountry(filters.country);
      if (canonical) {
        query = query.eq('country', canonical);
      } else {
        const names = continentToCountryNames(filters.country);
        if (names) query = query.in('country', names);
      }
    }

    const { data, error } = await query;
    if (error) this.logger.error('fetchEventDetails error', error);

    return (data ?? []).sort(
      (a, b) =>
        (simMap.get((b as unknown as Record<string, unknown>).id as string) ?? 0) -
        (simMap.get((a as unknown as Record<string, unknown>).id as string) ?? 0),
    );
  }
}

// ── Country name resolution ───────────────────────────────────────────────────
// DB stores canonical country names (country_enum). The LLM returns full names
// or aliases — resolveCountryName (from @expertly/utils) normalises them.

// ── Continent/region → canonical country names ──────────────────────────────
// When the LLM extracts a continent or regional name, expand to country names
// matching the country_enum values stored in the DB.

const CONTINENT_COUNTRY_MAP: Record<string, string[]> = {
  europe: ['United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Portugal', 'Belgium',
           'Ireland', 'Netherlands', 'Sweden', 'Denmark', 'Norway', 'Finland',
           'Switzerland', 'Austria', 'Poland', 'Czech Republic', 'Hungary', 'Romania',
           'Greece', 'Turkey', 'Ukraine', 'Russia'],
  'western europe': ['United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Portugal',
                     'Belgium', 'Ireland', 'Netherlands', 'Switzerland', 'Austria'],
  'eastern europe': ['Poland', 'Czech Republic', 'Hungary', 'Romania', 'Ukraine', 'Russia', 'Greece'],
  'northern europe': ['Sweden', 'Denmark', 'Norway', 'Finland', 'Ireland', 'United Kingdom'],
  'southern europe': ['Spain', 'Italy', 'Portugal', 'Greece', 'Turkey'],
  africa: ['Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Senegal', 'Egypt', 'Ethiopia',
           'Tanzania', 'Uganda', 'Rwanda', 'Zimbabwe', 'Morocco', 'Tunisia', 'Algeria',
           'Libya', "Côte d'Ivoire", 'Cameroon', 'Angola', 'Mozambique'],
  'west africa': ['Nigeria', 'Ghana', 'Senegal', "Côte d'Ivoire", 'Cameroon'],
  'east africa': ['Kenya', 'Ethiopia', 'Tanzania', 'Uganda', 'Rwanda'],
  'north africa': ['Egypt', 'Morocco', 'Tunisia', 'Algeria', 'Libya'],
  'southern africa': ['South Africa', 'Zimbabwe', 'Mozambique', 'Angola'],
  'middle east': ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain',
                  'Oman', 'Lebanon', 'Jordan', 'Egypt', 'Iraq', 'Iran', 'Israel'],
  mena: ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
         'Lebanon', 'Jordan', 'Egypt', 'Iraq', 'Iran', 'Morocco', 'Tunisia', 'Algeria'],
  gulf: ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'],
  gcc: ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'],
  asia: ['India', 'China', 'Japan', 'South Korea', 'Singapore', 'Malaysia', 'Indonesia',
         'Thailand', 'Vietnam', 'Philippines', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal'],
  'south asia': ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal'],
  'southeast asia': ['Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines'],
  'east asia': ['China', 'Japan', 'South Korea'],
  'north america': ['United States', 'Canada', 'Mexico'],
  'latin america': ['Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela'],
  'south america': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela'],
  oceania: ['Australia', 'New Zealand'],
};

/** Returns the canonical country name, or null if unrecognised. */
function resolveCountry(name: string): string | null {
  return resolveCountryName(name);
}

/** Returns a list of canonical country names for a continent/region, or null. */
function continentToCountryNames(name: string): string[] | null {
  const key = name.trim().toLowerCase();
  return CONTINENT_COUNTRY_MAP[key] ?? null;
}
