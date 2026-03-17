import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmbeddingService } from '../../common/services/embedding.service';
import { AuthUser } from '@expertly/types';
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

    // Country stored as ISO-2 — try single country first, then continent/region
    if (filters.country) {
      const iso = countryToIso(filters.country);
      if (iso) {
        query = query.eq('country', iso);
      } else {
        const isos = continentToIsos(filters.country);
        if (isos) query = query.in('country', isos);
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

    // Country stored as ISO-2 — try single country first, then continent/region
    if (filters.country) {
      const iso = countryToIso(filters.country);
      if (iso) {
        query = query.eq('country', iso);
      } else {
        const isos = continentToIsos(filters.country);
        if (isos) query = query.in('country', isos);
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

// ── Country name → ISO-2 code ─────────────────────────────────────────────────
// The LLM returns full country names; the DB stores ISO-2 codes.
// Returns null if the name is unrecognised (filter is skipped).

const COUNTRY_ISO_MAP: Record<string, string> = {
  india: 'IN', 'united kingdom': 'GB', uk: 'GB', britain: 'GB', england: 'GB',
  'united states': 'US', usa: 'US', us: 'US', america: 'US',
  uae: 'AE', 'united arab emirates': 'AE', emirates: 'AE',
  singapore: 'SG', australia: 'AU', germany: 'DE', france: 'FR',
  nigeria: 'NG', kenya: 'KE', 'south africa': 'ZA', ghana: 'GH',
  senegal: 'SN', egypt: 'EG', lebanon: 'LB', kuwait: 'KW',
  pakistan: 'PK', china: 'CN', japan: 'JP', 'south korea': 'KR', korea: 'KR',
  brazil: 'BR', spain: 'ES', italy: 'IT', portugal: 'PT',
  belgium: 'BE', ireland: 'IE', denmark: 'DK', norway: 'NO',
  netherlands: 'NL', holland: 'NL', sweden: 'SE', finland: 'FI',
  switzerland: 'CH', austria: 'AT', poland: 'PL', czechia: 'CZ', 'czech republic': 'CZ',
  hungary: 'HU', romania: 'RO', greece: 'GR', turkey: 'TR',
  'saudi arabia': 'SA', ksa: 'SA', qatar: 'QA', bahrain: 'BH', oman: 'OM',
  'new zealand': 'NZ', canada: 'CA', mexico: 'MX',
  indonesia: 'ID', malaysia: 'MY', thailand: 'TH', vietnam: 'VN', philippines: 'PH',
  bangladesh: 'BD', 'sri lanka': 'LK', nepal: 'NP',
  ethiopia: 'ET', tanzania: 'TZ', uganda: 'UG', rwanda: 'RW', zimbabwe: 'ZW',
  morocco: 'MA', tunisia: 'TN', algeria: 'DZ', libya: 'LY',
  'ivory coast': 'CI', cameroon: 'CM', angola: 'AO', mozambique: 'MZ',
  argentina: 'AR', chile: 'CL', colombia: 'CO', peru: 'PE', venezuela: 'VE',
  ukraine: 'UA', russia: 'RU', israel: 'IL', jordan: 'JO', iraq: 'IQ', iran: 'IR',
};

// ── Continent/region → ISO-2 codes ───────────────────────────────────────────
// When the LLM extracts a continent or regional name, expand to known ISO codes.

const CONTINENT_ISO_MAP: Record<string, string[]> = {
  europe: ['GB', 'DE', 'FR', 'ES', 'IT', 'PT', 'BE', 'IE', 'NL', 'SE', 'DK', 'NO', 'FI',
           'CH', 'AT', 'PL', 'CZ', 'HU', 'RO', 'GR', 'TR', 'UA', 'RU'],
  'western europe': ['GB', 'DE', 'FR', 'ES', 'IT', 'PT', 'BE', 'IE', 'NL', 'CH', 'AT'],
  'eastern europe': ['PL', 'CZ', 'HU', 'RO', 'UA', 'RU', 'GR'],
  'northern europe': ['SE', 'DK', 'NO', 'FI', 'IE', 'GB'],
  'southern europe': ['ES', 'IT', 'PT', 'GR', 'TR'],
  africa: ['NG', 'KE', 'ZA', 'GH', 'SN', 'EG', 'ET', 'TZ', 'UG', 'RW', 'ZW',
           'MA', 'TN', 'DZ', 'LY', 'CI', 'CM', 'AO', 'MZ'],
  'west africa': ['NG', 'GH', 'SN', 'CI', 'CM'],
  'east africa': ['KE', 'ET', 'TZ', 'UG', 'RW'],
  'north africa': ['EG', 'MA', 'TN', 'DZ', 'LY'],
  'southern africa': ['ZA', 'ZW', 'MZ', 'AO'],
  'middle east': ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'LB', 'JO', 'EG', 'IQ', 'IR', 'IL'],
  mena: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'LB', 'JO', 'EG', 'IQ', 'IR', 'MA', 'TN', 'DZ'],
  gulf: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'],
  gcc: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'],
  asia: ['IN', 'CN', 'JP', 'KR', 'SG', 'MY', 'ID', 'TH', 'VN', 'PH', 'PK', 'BD', 'LK', 'NP'],
  'south asia': ['IN', 'PK', 'BD', 'LK', 'NP'],
  'southeast asia': ['SG', 'MY', 'ID', 'TH', 'VN', 'PH'],
  'east asia': ['CN', 'JP', 'KR'],
  'north america': ['US', 'CA', 'MX'],
  'latin america': ['BR', 'MX', 'AR', 'CL', 'CO', 'PE', 'VE'],
  'south america': ['BR', 'AR', 'CL', 'CO', 'PE', 'VE'],
  oceania: ['AU', 'NZ'],
};

/** Returns a single ISO-2 code for a country name, or null. */
function countryToIso(name: string): string | null {
  const key = name.trim().toLowerCase();
  // Already an ISO-2 code (e.g. "IN", "GB") — pass through
  if (/^[a-z]{2}$/i.test(key)) return key.toUpperCase();
  return COUNTRY_ISO_MAP[key] ?? null;
}

/** Returns a list of ISO-2 codes for a continent/region name, or null. */
function continentToIsos(name: string): string[] | null {
  const key = name.trim().toLowerCase();
  return CONTINENT_ISO_MAP[key] ?? null;
}
