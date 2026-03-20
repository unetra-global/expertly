import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { SupabaseService } from '../../common/services/supabase.service';
import { CacheService } from '../../common/services/cache.service';
import { EmailService } from '../../common/services/email.service';
import { EmbeddingService } from '../../common/services/embedding.service';
import { QUEUE_NAMES, QUEUE_JOB_TYPES, getQueueConnection, isQueueDisabled } from '../../config/queue.config';
import { AuthUser, PaginationMeta } from '@expertly/types';
import { QueryMembersDto } from './dto/query-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { AiSearchDto } from './dto/ai-search.dto';

// ─── Constants ────────────────────────────────────────────────────────────────

const FEATURED_TTL = 600;  // 10 min
const PROFILE_TTL = 600;   // 10 min
const LIST_TTL = 300;      // 5 min

// Fields that trigger badge removal when updated
const BADGE_SENSITIVE_FIELDS: (keyof UpdateMemberDto)[] = [
  'headline',
  'bio',
  'designation',
  'qualifications',
  'credentials',
  'work_experience',
  'education',
];

// Fields whose content is embedded — changing any of these triggers a re-embed
const EMBEDDABLE_FIELDS: (keyof UpdateMemberDto)[] = [
  'designation',
  'headline',
  'bio',
  'country',
  'city',
  'qualifications',
];

// Teaser fields for guests (no auth)
const TEASER_FIELDS =
  'id, slug, designation, headline, profile_photo_url, avatar_url, ' +
  'city, country, member_tier, is_verified, primary_service_id, ' +
  'users!user_id(first_name, last_name, profile_photo_base64), ' +
  'services!primary_service_id(id, name, service_categories!category_id(id, name))';

// Full fields for authenticated users
const FULL_FIELDS =
  'id, slug, designation, headline, bio, profile_photo_url, avatar_url, ' +
  'city, country, member_tier, is_verified, primary_service_id, firm_name, ' +
  'years_of_experience, consultation_fee_min_usd, consultation_fee_max_usd, ' +
  'website, linkedin_url, ' +
  'contact_phone, contact_email, ' +
  'availability, engagement, engagements, ' +
  'work_experience, education, credentials, qualifications, testimonials, ' +
  'is_featured, view_count, membership_status, created_at, updated_at, ' +
  'users!user_id(first_name, last_name, email, profile_photo_base64), ' +
  'services!primary_service_id(id, name, service_categories!category_id(id, name))';

// Full fields for /me endpoint (all JSONB, no embedding)
const ME_FIELDS =
  'id, user_id, slug, designation, headline, bio, profile_photo_url, avatar_url, ' +
  'city, country, website, linkedin_url, ' +
  'membership_status, member_tier, is_verified, verified_at, is_featured, ' +
  'primary_service_id, years_of_experience, consultation_fee_min_usd, ' +
  'consultation_fee_max_usd, qualifications, availability, engagement, ' +
  'credentials, testimonials, work_experience, education, view_count, ' +
  'membership_start_date, membership_expiry_date, ' +
  're_verification_requested_at, re_verification_reason, ' +
  'pending_service_change, pending_service_change_at, ' +
  'created_at, updated_at, ' +
  'users!user_id(id, email, first_name, last_name, role, profile_photo_base64), ' +
  'services!primary_service_id(id, name, slug)';

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildListCacheKey(cache: CacheService, dto: QueryMembersDto): string {
  const parts = [
    `p${dto.page ?? 1}`,
    `l${dto.limit ?? 20}`,
    dto.search ? `s${dto.search}` : '',
    dto.country ? `c${dto.country}` : '',
    dto.serviceId ? `svc${dto.serviceId}` : '',
    dto.serviceIds ? `svcs${dto.serviceIds}` : '',
    dto.memberTier ? `t${dto.memberTier}` : '',
    dto.minYearsExperience !== undefined ? `y${dto.minYearsExperience}` : '',
    dto.maxHourlyRate !== undefined ? `hr${dto.maxHourlyRate}` : '',
    dto.sort ? `o${dto.sort}` : '',
    dto.isVerified !== undefined ? `v${String(dto.isVerified)}` : '',
  ]
    .filter(Boolean)
    .join('_');

  return cache.buildKey('members', 'list', parts);
}

function getCountryAliases(country: string): string[] {
  const normalized = country.trim().toLowerCase();
  const aliases = new Set<string>([country.trim()]);

  if (normalized === 'united kingdom' || normalized === 'uk') {
    aliases.add('United Kingdom');
    aliases.add('UK');
  }

  if (
    normalized === 'united states' ||
    normalized === 'united states of america' ||
    normalized === 'usa' ||
    normalized === 'us'
  ) {
    aliases.add('United States');
    aliases.add('United States of America');
    aliases.add('USA');
    aliases.add('US');
  }

  if (normalized === 'united arab emirates' || normalized === 'uae') {
    aliases.add('United Arab Emirates');
    aliases.add('UAE');
  }

  return Array.from(aliases);
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  private readonly aiQueue: Queue | null;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly cache: CacheService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
    private readonly embeddingService: EmbeddingService,
  ) {
    this.aiQueue = isQueueDisabled(config)
      ? null
      : new Queue(QUEUE_NAMES.AI, { connection: getQueueConnection(config) });
  }

  // ─── Featured ────────────────────────────────────────────────────────────────

  async getFeatured(): Promise<unknown[]> {
    const key = this.cache.buildKey('members', 'featured');

    return this.cache.getOrFetch<unknown[]>(
      key,
      async () => {
        const { data, error } = await this.supabase.adminClient
          .from('members')
          .select(TEASER_FIELDS)
          .eq('is_featured', true)
          .eq('membership_status', 'active')
          .limit(6);

        if (error) throw error;
        return data ?? [];
      },
      FEATURED_TTL,
    );
  }

  // ─── List ─────────────────────────────────────────────────────────────────────

  async getList(
    dto: QueryMembersDto,
    user: AuthUser | null,
  ): Promise<{ data: unknown[]; meta: PaginationMeta }> {
    const isAuth = !!user;
    const rawLimit = dto.limit ?? 20;
    const limit = isAuth ? Math.min(rawLimit, 50) : Math.min(rawLimit, 20);
    const page = dto.page ?? 1;
    const offset = (page - 1) * limit;

    // Guests: hard cap at 20 total results (spec: "MAX 20 results — sign in to see more")
    if (!isAuth && offset >= 20) {
      return {
        data: [],
        meta: { page, limit, total: 20, totalPages: 1, hasNext: false, hasPrev: page > 1, guestCap: true } as PaginationMeta & { guestCap: boolean },
      };
    }

    // For guests on page 1, clamp range so we never return > 20 results
    const guestClampedLimit = !isAuth ? Math.min(limit, 20 - offset) : limit;

    const cacheKey = buildListCacheKey(this.cache, { ...dto, limit });

    return this.cache.getOrFetch(
      cacheKey,
      async () => {
        const fields = isAuth ? FULL_FIELDS : TEASER_FIELDS;

        let query = this.supabase.adminClient
          .from('members')
          .select(fields, { count: 'exact' })
          .eq('membership_status', 'active')
          .range(offset, offset + guestClampedLimit - 1);

        if (dto.search) {
          query = query.or(`headline.ilike.%${dto.search}%,designation.ilike.%${dto.search}%`);
        }
        if (dto.country) {
          const aliases = getCountryAliases(dto.country);
          if (aliases.length === 1) {
            query = query.ilike('country', `%${aliases[0]}%`);
          } else {
            const countryFilters = aliases
              .map((alias) => `country.ilike.%${alias.replace(/[,]/g, ' ')}%`)
              .join(',');
            query = query.or(countryFilters);
          }
        }
        if (dto.serviceIds) {
          const ids = dto.serviceIds.split(',').map((id) => id.trim()).filter(Boolean);
          if (ids.length > 0) {
            query = query.in('primary_service_id', ids);
          }
        } else if (dto.serviceId) {
          query = query.eq('primary_service_id', dto.serviceId);
        }
        if (dto.memberTier) {
          query = query.eq('member_tier', dto.memberTier);
        }
        if (dto.minYearsExperience !== undefined) {
          query = query.gte('years_of_experience', dto.minYearsExperience);
        }
        if (dto.maxHourlyRate !== undefined) {
          query = query.lte('consultation_fee_min_usd', dto.maxHourlyRate);
        }
        if (dto.isVerified !== undefined) {
          query = query.eq('is_verified', dto.isVerified);
        }

        switch (dto.sort) {
          case 'fee_asc':
            query = query.order('consultation_fee_min_usd', { ascending: true });
            break;
          case 'fee_desc':
            query = query.order('consultation_fee_min_usd', { ascending: false });
            break;
          case 'experience_desc':
            query = query.order('years_of_experience', { ascending: false });
            break;
          default:
            query = query.order('is_featured', { ascending: false });
            break;
        }

        const { data, error, count } = await query;

        if (error) throw error;

        const total = count ?? 0;
        const totalPages = Math.ceil(total / limit);

        return {
          data: data ?? [],
          meta: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        };
      },
      LIST_TTL,
    );
  }

  // ─── By Slug ─────────────────────────────────────────────────────────────────

  async getBySlug(slug: string, user: AuthUser | null): Promise<unknown> {
    const isAuth = !!user;
    const cacheKey = this.cache.buildKey('members', 'profile', slug);

    const result = await this.cache.getOrFetch<unknown | null>(
      cacheKey,
      async () => {
        const fields = isAuth ? FULL_FIELDS : TEASER_FIELDS;

        const { data, error } = await this.supabase.adminClient
          .from('members')
          .select(fields)
          .eq('slug', slug)
          .eq('membership_status', 'active')
          .single();

        if (error) return null;
        return data;
      },
      PROFILE_TTL,
    );

    if (!result) {
      throw new NotFoundException(`Member with slug '${slug}' not found`);
    }

    // Increment view count directly in DB (fire-and-forget)
    const memberId = (result as { id?: string }).id;
    if (memberId) {
      void Promise.resolve(
        this.supabase.adminClient.rpc('increment_member_view_count', { p_member_id: memberId, p_count: 1 }),
      ).catch((err: Error) => this.logger.warn(`View count increment failed: ${err.message}`));
    }

    return result;
  }

  // ─── By ID ───────────────────────────────────────────────────────────────────

  async getById(id: string): Promise<unknown> {
    const { data, error } = await this.supabase.adminClient
      .from('members')
      .select(FULL_FIELDS)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Member with id '${id}' not found`);
    }

    return data;
  }

  // ─── Me ──────────────────────────────────────────────────────────────────────

  async getMe(user: AuthUser): Promise<unknown> {
    if (!user.memberId) {
      throw new NotFoundException('Member record not found');
    }

    const { data, error } = await this.supabase.adminClient
      .from('members')
      .select(ME_FIELDS)
      .eq('id', user.memberId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Member record not found');
    }

    // Include notification preferences (spec columns)
    const { data: prefs } = await this.supabase.adminClient
      .from('member_notification_preferences')
      .select('consultation_requests, article_status, membership_reminders, regulatory_nudges, platform_updates')
      .eq('member_id', user.memberId)
      .single();

    return { ...data as object, notification_preferences: prefs ?? null };
  }

  // ─── Update Me ───────────────────────────────────────────────────────────────

  async updateMe(user: AuthUser, dto: UpdateMemberDto): Promise<unknown> {
    if (!user.memberId) {
      throw new NotFoundException('Member record not found');
    }

    // Detect badge-sensitive field changes
    const changedBadgeFields = BADGE_SENSITIVE_FIELDS.filter(
      (f) => dto[f] !== undefined,
    ) as string[];

    const updatePayload: Record<string, unknown> = { ...dto };

    if (changedBadgeFields.length > 0) {
      updatePayload.is_verified = false;
      updatePayload.re_verification_requested_at = new Date().toISOString();
      updatePayload.re_verification_reason = `Fields updated: ${changedBadgeFields.join(', ')}`;
    }

    const { data, error } = await this.supabase.adminClient
      .from('members')
      .update(updatePayload)
      .eq('id', user.memberId)
      .select(ME_FIELDS)
      .single();

    if (error) throw error;

    // Send K11 badge removal email (non-fatal)
    if (changedBadgeFields.length > 0) {
      const memberData = data as unknown as Record<string, unknown>;
      const userJoin = memberData.users as Record<string, unknown> | null;
      if (userJoin?.email) {
        const firstName = String(userJoin.first_name ?? '');
        const lastName = String(userJoin.last_name ?? '');
        this.email.sendEmail(
          'K11',
          String(userJoin.email),
          {
            memberName: `${firstName} ${lastName}`.trim(),
            reason: `Fields updated: ${changedBadgeFields.join(', ')}`,
          },
        ).catch((err: Error) =>
          this.logger.warn(`K11 email failed for ${user.memberId}: ${err.message}`),
        );
      }
    }

    // Invalidate cache
    const slug = (data as { slug?: string }).slug;
    await Promise.all([
      this.cache.del(this.cache.buildKey('members', 'profile', slug ?? '')),
      this.cache.delByPattern(this.cache.buildKey('members', 'list', '*')),
      this.cache.del(this.cache.buildKey('members', 'featured')),
      this.cache.delByPattern('expertly:homepage:*'),
    ]);

    // ISR revalidate
    if (slug) {
      await this.supabase.revalidatePath(`/members/${slug}`);
    }

    // Re-embed if any embeddable field changed (jobId deduplicates rapid edits)
    const needsReEmbed = EMBEDDABLE_FIELDS.some((f) => dto[f] !== undefined);
    if (needsReEmbed) {
      await this.aiQueue?.add(
        QUEUE_JOB_TYPES.GENERATE_EMBEDDING,
        { entityType: 'member', entityId: user.memberId },
        { jobId: `embed:member:${user.memberId}` },
      );
    }

    return data;
  }

  // ─── Update Notifications ────────────────────────────────────────────────────

  async updateNotifications(
    user: AuthUser,
    dto: UpdateNotificationsDto,
  ): Promise<unknown> {
    if (!user.memberId) {
      throw new NotFoundException('Member record not found');
    }

    const { data, error } = await this.supabase.adminClient
      .from('member_notification_preferences')
      .upsert(
        { member_id: user.memberId, ...dto },
        { onConflict: 'member_id' },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ─── Service Change ───────────────────────────────────────────────────────────

  async requestServiceChange(
    user: AuthUser,
    serviceId: string,
  ): Promise<{ message: string }> {
    if (!user.memberId) {
      throw new NotFoundException('Member record not found');
    }

    const { error } = await this.supabase.adminClient
      .from('members')
      .update({
        pending_service_change: serviceId,
        pending_service_change_at: new Date().toISOString(),
      })
      .eq('id', user.memberId);

    if (error) throw error;

    return { message: 'Service change request submitted' };
  }

  // ─── AI Search ───────────────────────────────────────────────────────────────

  async aiSearch(dto: AiSearchDto, user: AuthUser | null): Promise<unknown[]> {
    const embedding = await this.embeddingService.embed(dto.query);
    if (!embedding) {
      return [];
    }

    // Call search_members RPC
    const { data: rpcResults, error } = await this.supabase.adminClient.rpc(
      'search_members',
      {
        query_embedding: embedding,
        similarity_threshold: 0.6,
        match_count: 20,
      },
    );

    if (error || !rpcResults || (rpcResults as unknown[]).length === 0) {
      return [];
    }

    const memberIds = (rpcResults as Array<{ id: string; similarity: number }>).map(
      (r) => r.id,
    );

    const similarityMap = new Map<string, number>(
      (rpcResults as Array<{ id: string; similarity: number }>).map((r) => [r.id, r.similarity]),
    );

    // Fetch member details
    const isAuth = !!user;
    const fields = isAuth ? FULL_FIELDS : TEASER_FIELDS;

    let query = this.supabase.adminClient
      .from('members')
      .select(fields)
      .in('id', memberIds);

    if (dto.filters?.country) {
      query = query.eq('country', dto.filters.country);
    }
    if (dto.filters?.serviceId) {
      query = query.eq('primary_service_id', dto.filters.serviceId);
    }
    if (dto.filters?.verified !== undefined) {
      query = query.eq('is_verified', dto.filters.verified);
    }

    const { data: members } = await query;
    if (!members) return [];

    // Attach similarity scores and sort
    return (members as unknown as Array<Record<string, unknown>>)
      .map((m) => ({
        ...m,
        similarity: similarityMap.get(m.id as string) ?? 0,
      }))
      .sort((a, b) => (b.similarity as number) - (a.similarity as number));
  }
}
