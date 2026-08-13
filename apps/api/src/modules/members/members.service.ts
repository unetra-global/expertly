import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { SupabaseService } from '../../common/services/supabase.service';
import { CacheService } from '../../common/services/cache.service';
import { EmailService } from '../../common/services/email.service';
import { EmbeddingService } from '../../common/services/embedding.service';
import { QUEUE_NAMES, QUEUE_JOB_TYPES, getQueueConnection, isQueueDisabled } from '../../config/queue.config';
import { AuthUser, PaginationMeta } from '@expertly/types';
import { resolveCountryName, MEMBER_TIERS, slugify, randomSuffix } from '@expertly/utils';
import { QueryMembersDto } from './dto/query-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { UpdateDigestsDto } from './dto/update-digests.dto';
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
  'id, slug, designation, headline, profile_photo_url, ' +
  'city, country, member_tier, is_verified, primary_service_id, ' +
  'users!user_id(first_name, last_name, profile_photo_url), ' +
  'services!primary_service_id(id, name, categories!category_id(id, name))';

// Full fields for authenticated users
const FULL_FIELDS =
  'id, slug, designation, headline, bio, profile_photo_url, ' +
  'city, country, member_tier, is_verified, primary_service_id, firm_name, ' +
  'years_of_experience, consultation_fee_min_usd, consultation_fee_max_usd, ' +
  'website, linkedin_url, ' +
  'contact_phone, contact_email, ' +
  'availability, achievements, career_highlights, ' +
  'work_experience, education, credentials, qualifications, testimonials, ' +
  'is_featured, membership_status, created_at, updated_at, ' +
  'users!user_id(first_name, last_name, email, profile_photo_url), ' +
  'services!primary_service_id(id, name, categories!category_id(id, name))';

// Full fields for /me endpoint (all JSONB, no embedding)
const ME_FIELDS =
  'id, user_id, slug, designation, headline, bio, profile_photo_url, ' +
  'city, country, website, linkedin_url, ' +
  'membership_status, member_tier, is_verified, verified_at, is_featured, ' +
  'primary_service_id, years_of_experience, consultation_fee_min_usd, ' +
  'consultation_fee_max_usd, qualifications, availability, ' +
  'credentials, testimonials, work_experience, education, achievements, career_highlights, ' +
  'membership_start_date, membership_expiry_date, ' +
  're_verification_requested_at, re_verification_reason, ' +
  'pending_service_change, pending_service_change_at, ' +
  'created_at, updated_at, ' +
  'users!user_id(id, email, first_name, last_name, role, profile_photo_url), ' +
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
          const canonical = resolveCountryName(dto.country);
          if (canonical) {
            query = query.eq('country', canonical);
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

    // Include the three user-configurable notification preferences
    const { data: prefs } = await this.supabase.adminClient
      .from('member_notification_preferences')
      .select('article_status, platform_updates')
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

  // ─── Get Digest Subscriptions ────────────────────────────────────────────────

  async getDigests(user: AuthUser): Promise<unknown[]> {
    // Fetch all categories and the user's active subscriptions in parallel
    const [categoriesResult, subsResult] = await Promise.all([
      this.supabase.adminClient
        .from('categories')
        .select('id, name')
        .neq('name', 'Others')
        .order('name'),
      this.supabase.adminClient
        .from('user_digest_subscriptions')
        .select('category_id, frequency, is_active')
        .eq('user_id', user.dbId),
    ]);

    const categories = (categoriesResult.data ?? []) as Array<{ id: string; name: string }>;
    const subs = (subsResult.data ?? []) as Array<{
      category_id: string;
      frequency: string;
      is_active: boolean;
    }>;

    const subMap = new Map(subs.map((s) => [s.category_id, s]));

    return categories.map((cat) => {
      const sub = subMap.get(cat.id);
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        isSubscribed: sub?.is_active ?? false,
        frequency: sub?.frequency ?? 'weekly',
      };
    });
  }

  // ─── Update Digest Subscriptions ─────────────────────────────────────────────

  async updateDigests(user: AuthUser, dto: UpdateDigestsDto): Promise<void> {
    for (const item of dto.subscriptions) {
      // Check if a subscription row already exists for this user+category
      const { data: existing } = await this.supabase.adminClient
        .from('user_digest_subscriptions')
        .select('id')
        .eq('user_id', user.dbId)
        .eq('category_id', item.categoryId)
        .maybeSingle() as { data: { id: string } | null };

      if (existing) {
        // Update existing row
        const { error: updateErr } = await this.supabase.adminClient
          .from('user_digest_subscriptions')
          .update({
            is_active: item.isSubscribed,
            frequency: item.frequency ?? 'weekly',
          })
          .eq('id', existing.id);
        if (updateErr) {
          this.logger.error(`Digest update failed for user ${user.dbId}, category ${item.categoryId}: ${updateErr.message}`);
        }
      } else if (item.isSubscribed) {
        // Only insert a new row if the user is subscribing (not unsubscribing a non-existent row)
        const { error: insertErr } = await this.supabase.adminClient
          .from('user_digest_subscriptions')
          .insert({
            user_id: user.dbId,
            email: user.email,
            category_id: item.categoryId,
            frequency: item.frequency ?? 'weekly',
            is_active: true,
          });
        if (insertErr) {
          this.logger.error(`Digest insert failed for user ${user.dbId}, category ${item.categoryId}: ${insertErr.message} | code: ${insertErr.code}`);
        }
      }
    }
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

  // ── Ops ───────────────────────────────────────────────────────────────────

  async listOpsMembers(query: {
    pendingReVerification?: boolean;
    pendingServiceChange?: boolean;
    expiringDays?: number;
    page?: number;
    limit?: number;
  }) {
    const sb = this.supabase.adminClient;
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20);
    const offset = (page - 1) * limit;

    let q = sb
      .from('members')
      .select(
        'id, slug, designation, membership_status, is_verified, country, ' +
        'is_featured, member_tier, membership_expiry_date, created_at, ' +
        'pending_service_change, re_verification_requested_at, ' +
        'user:users!user_id(first_name, last_name)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.pendingReVerification) q = q.not('re_verification_requested_at', 'is', null);
    if (query.pendingServiceChange) q = q.not('pending_service_change', 'is', null);
    if (query.expiringDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + query.expiringDays);
      q = q
        .gte('membership_expiry_date', new Date().toISOString().split('T')[0])
        .lte('membership_expiry_date', cutoff.toISOString().split('T')[0]);
    }

    const { data, count, error } = await q;
    if (error) throw new BadRequestException(error.message);

    type MemberRow = {
      user: { first_name: string; last_name: string } | null;
      membership_expiry_date: string | null;
      [key: string]: unknown;
    };
    const flat = (data as unknown as MemberRow[] ?? []).map(({ user, membership_expiry_date, ...m }) => ({
      ...m,
      membership_expiry_at: membership_expiry_date,
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
    }));

    return {
      data: flat,
      meta: { total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) },
    };
  }

  async getOpsMember(id: string) {
    const { data, error } = await this.supabase.adminClient
      .from('members')
      .select(
        'id, slug, designation, headline, bio, ' +
        'membership_status, is_verified, is_featured, member_tier, ' +
        'membership_start_date, membership_expiry_date, ' +
        'linkedin_url, profile_photo_url, ' +
        'country, city, region, state, ' +
        'contact_phone, contact_email, firm_name, firm_size, website, ' +
        'years_of_experience, consultation_fee_min_usd, consultation_fee_max_usd, ' +
        'qualifications, credentials, work_experience, education, testimonials, achievements, career_highlights, ' +
        'primary_service_id, ' +
        'pending_service_change, re_verification_requested_at, user_id, created_at, updated_at, ' +
        'user:users!user_id(first_name, last_name, email, profile_photo_url)',
      )
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Member not found');

    const { user, membership_expiry_date, ...m } = data as unknown as {
      user: { first_name: string; last_name: string; email: string; profile_photo_url: string | null } | null;
      membership_expiry_date: string | null;
      [key: string]: unknown;
    };
    return {
      ...m,
      membership_expiry_at: membership_expiry_date,
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
      profile_photo_url: user?.profile_photo_url ?? null,
    };
  }

  async activateMember(
    applicationId: string,
    operator: AuthUser,
    body: { paymentReceivedAt?: string; membershipExpiryAt?: string; paymentReceivedBy?: string },
  ) {
    const sb = this.supabase.adminClient;

    const { data: app } = await sb
      .from('applications')
      .select(
        'id, status, user_id, first_name, last_name, designation, headline, bio, ' +
        'linkedin_url, profile_photo_url, firm_name, firm_size, website_url, region, country, state, ' +
        'phone_extension, phone, contact_email, city, ' +
        'years_of_experience, consultation_fee_min_usd, consultation_fee_max_usd, ' +
        'work_experience, education, primary_service_id, membership_tier, ' +
        'secondary_service_ids, achievements, career_highlights',
      )
      .eq('id', applicationId)
      .single();

    if (!app) throw new NotFoundException('Application not found');
    const a = app as unknown as Record<string, unknown>;

    if (a['status'] !== 'approved') {
      throw new BadRequestException('Application must be in approved status before activation');
    }
    if (operator.dbId === a['user_id']) {
      throw new BadRequestException('Operators cannot activate their own application');
    }

    const baseName = slugify(`${a['first_name'] ?? ''} ${a['last_name'] ?? ''}`);
    let slug = baseName;
    for (let i = 0; i < 10; i++) {
      const { data: existing } = await sb.from('members').select('id').eq('slug', slug).maybeSingle();
      if (!existing) break;
      slug = `${baseName}-${randomSuffix()}`;
    }

    const expiryAt = body.membershipExpiryAt ?? (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString();
    })();

    const { data: member, error: memberErr } = await sb
      .from('members')
      .insert({
        user_id: a['user_id'],
        slug,
        designation: a['designation'],
        headline: a['headline'] ?? '',
        bio: a['bio'] ?? '',
        linkedin_url: a['linkedin_url'],
        profile_photo_url: a['profile_photo_url'],
        firm_name: a['firm_name'],
        firm_size: a['firm_size'],
        website: a['website_url'],
        region: a['region'],
        country: a['country'],
        state: a['state'],
        city: a['city'],
        contact_phone: a['phone_extension'] && a['phone'] ? `${a['phone_extension']} ${a['phone']}` : (a['phone'] ?? null),
        contact_email: a['contact_email'],
        years_of_experience: a['years_of_experience'],
        consultation_fee_min_usd: a['consultation_fee_min_usd'],
        consultation_fee_max_usd: a['consultation_fee_max_usd'],
        work_experience: a['work_experience'] ?? [],
        education: a['education'] ?? [],
        primary_service_id: a['primary_service_id'],
        achievements: a['achievements'] ?? [],
        career_highlights: a['career_highlights'] ?? [],
        member_tier: a['membership_tier'] ?? 'budding_professional',
        membership_status: 'active',
        membership_start_date: new Date().toISOString().split('T')[0],
        membership_expiry_date: expiryAt,
        payment_received_at: body.paymentReceivedAt ?? new Date().toISOString(),
        activated_at: new Date().toISOString(),
        activated_by: operator.dbId,
        is_verified: false,
        is_featured: false,
      })
      .select('id')
      .single();

    if (memberErr || !member) {
      this.logger.error('Failed to create member record', memberErr);
      throw new BadRequestException('Failed to create member record');
    }

    const memberId = (member as unknown as { id: string }).id;

    const serviceIds: string[] = [
      a['primary_service_id'] as string,
      ...((a['secondary_service_ids'] as string[] | null) ?? []),
    ].filter(Boolean);

    for (const serviceId of serviceIds) {
      await sb.from('member_services').insert({
        member_id: memberId,
        service_id: serviceId,
        is_primary: serviceId === a['primary_service_id'],
      });
    }

    await sb.from('users').update({ role: 'member' }).eq('id', a['user_id'] as string);

    await sb.from('member_notification_preferences').insert({
      member_id: memberId,
      email_on_consultation: true,
      email_on_article_comment: true,
      email_on_event_rsvp: true,
      article_status: true,
      platform_updates: true,
    });

    const { data: svcData } = await sb.from('services').select('category_id').eq('id', a['primary_service_id'] as string).single();
    if (svcData) {
      const { data: userData } = await sb.from('users').select('email').eq('id', a['user_id'] as string).single();
      await sb.from('user_digest_subscriptions').insert({
        user_id: a['user_id'],
        email: (userData as unknown as { email: string })?.email ?? '',
        category_id: (svcData as unknown as { category_id: string }).category_id,
        is_active: true,
        frequency: 'weekly',
      });
    }

    await sb.from('applications').update({ status: 'activated', activated_at: new Date().toISOString() }).eq('id', applicationId);

    await this.aiQueue?.add(QUEUE_JOB_TYPES.GENERATE_EMBEDDING, { entityType: 'member', entityId: memberId });

    await this.cache.delByPattern('expertly:members:*');
    await this.cache.delByPattern('expertly:homepage:*');

    try {
      await this.supabase.revalidatePath(`/members/${slug}`);
    } catch (err) {
      this.logger.warn(`ISR revalidation failed: ${(err as Error).message}`);
    }

    const { data: userData } = await sb.from('users').select('email').eq('id', a['user_id'] as string).single();
    await this.email.sendK17MemberActivated({
      to: (userData as unknown as { email: string })?.email ?? '',
      memberName: `${a['first_name'] ?? ''} ${a['last_name'] ?? ''}`.trim(),
      memberSlug: slug,
    });

    return { memberId, slug };
  }

  async verifyMember(id: string) {
    const sb = this.supabase.adminClient;

    const { data: member } = await sb
      .from('members')
      .select('id, user_id, user:users!user_id(first_name, last_name, email)')
      .eq('id', id)
      .single();

    if (!member) throw new NotFoundException('Member not found');
    const m = member as unknown as { user: { first_name: string; last_name: string; email: string } | null };

    await sb.from('members').update({ is_verified: true, verified_at: new Date().toISOString() }).eq('id', id);

    await this.email.sendK12VerifiedBadgeAwarded({
      to: m.user?.email ?? '',
      memberName: `${m.user?.first_name ?? ''} ${m.user?.last_name ?? ''}`.trim(),
    });

    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Member verified' };
  }

  async suspendMember(id: string) {
    await this.supabase.adminClient.from('members').update({ membership_status: 'suspended' }).eq('id', id);
    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Member suspended' };
  }

  async updateMemberTier(id: string, body: { tier: string }) {
    const validTiers: readonly string[] = MEMBER_TIERS;
    if (!validTiers.includes(body.tier)) {
      throw new BadRequestException(`Invalid tier: ${body.tier}. Must be one of: ${MEMBER_TIERS.join(', ')}`);
    }
    await this.supabase.adminClient.from('members').update({ member_tier: body.tier }).eq('id', id);
    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Tier updated' };
  }

  async toggleFeatured(id: string, body: { isFeatured: boolean }) {
    await this.supabase.adminClient.from('members').update({ is_featured: body.isFeatured }).eq('id', id);
    await this.cache.delByPattern('expertly:members:*');
    await this.cache.delByPattern('expertly:homepage:*');
    return { message: 'Featured status updated' };
  }

  async addCredential(memberId: string, body: { name: string; issuingBody?: string; year?: number; url?: string; isVerified?: boolean }) {
    const { data: member } = await this.supabase.adminClient.from('members').select('credentials').eq('id', memberId).single();
    if (!member) throw new NotFoundException('Member not found');

    const credentials = (((member as unknown as { credentials: unknown[] }).credentials) ?? []).slice();
    credentials.push({
      id: crypto.randomUUID(),
      name: body.name,
      issuing_body: body.issuingBody ?? null,
      year: body.year ?? null,
      url: body.url ?? null,
      is_verified: body.isVerified ?? false,
      verified_at: body.isVerified ? new Date().toISOString() : null,
    });

    await this.supabase.adminClient.from('members').update({ credentials }).eq('id', memberId);
    return { message: 'Credential added' };
  }

  async verifyCredential(memberId: string, body: { credentialIndex: number; verified: boolean }) {
    const { data: member } = await this.supabase.adminClient.from('members').select('credentials').eq('id', memberId).single();
    if (!member) throw new NotFoundException('Member not found');

    const credentials = (((member as unknown as { credentials: unknown[] }).credentials) ?? []).slice();
    if (body.credentialIndex >= credentials.length) throw new BadRequestException('Credential index out of range');

    credentials[body.credentialIndex] = {
      ...(credentials[body.credentialIndex] as object),
      is_verified: body.verified,
      verified_at: body.verified ? new Date().toISOString() : null,
    };

    await this.supabase.adminClient.from('members').update({ credentials }).eq('id', memberId);
    return { message: 'Credential updated' };
  }

  async verifyTestimonial(memberId: string, body: { testimonialIndex: number; verified: boolean }) {
    return { message: 'Testimonial updated', memberId, body };
  }

  async approveServiceChange(id: string) {
    const sb = this.supabase.adminClient;

    const { data: member } = await sb
      .from('members')
      .select('id, user_id, pending_service_id, user:users!user_id(first_name, last_name, email)')
      .eq('id', id)
      .single();

    if (!member) throw new NotFoundException('Member not found');
    const m = member as unknown as { user_id: string; pending_service_id: string | null; user: { first_name: string; last_name: string; email: string } | null };

    if (!m.pending_service_id) throw new BadRequestException('No pending service change');

    const { data: svc } = await sb.from('services').select('name').eq('id', m.pending_service_id).single();

    await sb.from('members').update({ primary_service_id: m.pending_service_id, pending_service_id: null, is_verified: false }).eq('id', id);
    await sb.from('member_services').update({ is_primary: false }).eq('member_id', id);
    await sb.from('member_services').upsert({ member_id: id, service_id: m.pending_service_id, is_primary: true });

    const memberEmail = m.user?.email ?? '';
    const memberName = `${m.user?.first_name ?? ''} ${m.user?.last_name ?? ''}`.trim();

    await this.email.sendK19ServiceChangeApproved({ to: memberEmail, memberName, newServiceName: (svc as unknown as { name: string })?.name ?? '' });
    await this.email.sendK11VerifiedBadgeRemoved({ to: memberEmail, memberName, reason: 'Your service area has changed — re-verification required for the new practice area.' });

    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Service change approved' };
  }

  async rejectServiceChange(id: string, body: { rejectionReason: string }) {
    const sb = this.supabase.adminClient;

    const { data: member } = await sb
      .from('members')
      .select('id, user_id, user:users!user_id(first_name, last_name, email)')
      .eq('id', id)
      .single();

    if (!member) throw new NotFoundException('Member not found');
    const m = member as unknown as { user: { first_name: string; last_name: string; email: string } | null };

    await sb.from('members').update({ pending_service_id: null }).eq('id', id);

    await this.email.sendK20ServiceChangeRejected({
      to: m.user?.email ?? '',
      memberName: `${m.user?.first_name ?? ''} ${m.user?.last_name ?? ''}`.trim(),
      rejectionReason: body.rejectionReason,
    });

    return { message: 'Service change rejected' };
  }

  async renewMembership(
    id: string,
    operator: AuthUser,
    body: { paymentReceivedAt?: string; renewalPeriodYears?: number; membershipExpiryAt?: string; paymentReceivedBy?: string },
  ) {
    const sb = this.supabase.adminClient;

    const { data: member } = await sb
      .from('members')
      .select('id, user_id, membership_expiry_date, membership_status, user:users!user_id(first_name, last_name)')
      .eq('id', id)
      .single();

    if (!member) throw new NotFoundException('Member not found');
    const m = member as unknown as { user_id: string; membership_expiry_date: string | null };

    let newExpiry: string;
    if (body.membershipExpiryAt) {
      newExpiry = new Date(body.membershipExpiryAt).toISOString();
    } else {
      const years = body.renewalPeriodYears ?? 1;
      const base = m.membership_expiry_date ? new Date(m.membership_expiry_date) : new Date();
      base.setFullYear(base.getFullYear() + years);
      newExpiry = base.toISOString();
    }

    await sb.from('members').update({
      membership_expiry_date: newExpiry,
      membership_status: 'active',
      renewed_at: new Date().toISOString(),
      payment_received_at: body.paymentReceivedAt ?? new Date().toISOString(),
    }).eq('id', id);

    await sb.from('users').update({ role: 'member' }).eq('id', m.user_id).eq('role', 'user');

    const { data: user } = await sb.from('users').select('email, first_name, last_name').eq('id', m.user_id).single();
    const u = user as unknown as { email: string; first_name: string; last_name: string } | null;

    const formatted = new Date(newExpiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    await this.email.sendK22MembershipRenewed({
      to: u?.email ?? '',
      memberName: `${u?.first_name ?? ''} ${u?.last_name ?? ''}`.trim(),
      newExpiryDate: formatted,
    });

    // operator param reserved for audit logging
    void operator;

    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Membership renewed', newExpiryAt: newExpiry };
  }

  async expireOverdueMemberships() {
    const sb = this.supabase.adminClient;
    const today = new Date().toISOString().split('T')[0];

    const { data: members, error } = await sb
      .from('members')
      .select('id, slug, user_id, user:users!user_id(first_name, last_name, email)')
      .lte('membership_expiry_date', today)
      .eq('membership_status', 'active');

    if (error) throw new BadRequestException(error.message);
    if (!members || members.length === 0) {
      return { expired: 0, members: [] };
    }

    type Row = {
      id: string;
      slug: string;
      user_id: string;
      user: { first_name: string | null; last_name: string | null; email: string } | null;
    };

    const rows = members as unknown as Row[];
    const expired: { id: string; slug: string; email: string }[] = [];

    for (const m of rows) {
      try {
        await sb.from('members').update({ membership_status: 'expired' }).eq('id', m.id);
        await sb.from('users').update({ role: 'user' }).eq('id', m.user_id);

        await this.cache.delByPattern(`expertly:member:*${m.slug}*`);

        try {
          await this.supabase.revalidatePath(`/members/${m.slug}`);
        } catch (err) {
          this.logger.warn(`ISR revalidation failed for ${m.slug}: ${(err as Error).message}`);
        }

        if (m.user?.email) {
          await this.email.sendK14MembershipExpired({
            to: m.user.email,
            memberName: [m.user.first_name, m.user.last_name].filter(Boolean).join(' ') || 'Member',
          });
        }

        expired.push({ id: m.id, slug: m.slug, email: m.user?.email ?? '' });
      } catch (err) {
        this.logger.error(`Failed to expire member ${m.id}: ${(err as Error).message}`);
      }
    }

    await this.cache.delByPattern('expertly:members:*');
    await this.cache.delByPattern('expertly:homepage:*');

    return { expired: expired.length, members: expired };
  }

  async sendRenewalReminders(daysUntilExpiry = 30) {
    const sb = this.supabase.adminClient;
    const target = new Date();
    target.setDate(target.getDate() + daysUntilExpiry);
    const targetStr = target.toISOString().split('T')[0];

    const { data: members, error } = await sb
      .from('members')
      .select('id, membership_expiry_date, user:users!user_id(first_name, last_name, email)')
      .eq('membership_expiry_date', targetStr)
      .eq('membership_status', 'active');

    if (error) throw new BadRequestException(error.message);
    if (!members || members.length === 0) {
      return { sent: 0, daysUntilExpiry };
    }

    type Row = {
      id: string;
      membership_expiry_date: string;
      user: { first_name: string | null; last_name: string | null; email: string } | null;
    };

    const rows = members as unknown as Row[];
    let sent = 0;

    for (const m of rows) {
      try {
        if (!m.user?.email) continue;
        await this.email.sendK13RenewalReminder({
          to: m.user.email,
          memberName: [m.user.first_name, m.user.last_name].filter(Boolean).join(' ') || 'Member',
          expiryDate: m.membership_expiry_date,
          daysUntilExpiry,
        });
        sent++;
      } catch (err) {
        this.logger.error(`Failed to send K13 to member ${m.id}: ${(err as Error).message}`);
      }
    }

    return { sent, daysUntilExpiry };
  }
}
