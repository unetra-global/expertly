import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../common/services/supabase.service';
import { CacheService } from '../../common/services/cache.service';
import { EmailService } from '../../common/services/email.service';
import { AuthUser } from '@expertly/types';
import { slugify, randomSuffix } from '@expertly/utils';
import {
  QUEUE_NAMES,
  QUEUE_JOB_TYPES,
  getQueueConnection,
} from '../../config/queue.config';

const LEGAL_DISCLAIMER_HTML = `
  <hr style="margin: 32px 0; border-color: #e5e7eb">
  <p style="font-size: 13px; color: #6b7280; font-style: italic">
    This article is for informational purposes only and does not
    constitute professional advice. Always consult a qualified
    professional before acting on any information herein.
  </p>
`;

@Injectable()
export class OpsService {
  private readonly logger = new Logger(OpsService.name);
  private readonly aiQueue: Queue;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly cache: CacheService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {
    this.aiQueue = new Queue(QUEUE_NAMES.AI, {
      connection: getQueueConnection(config),
    });
  }

  // ── Applications ──────────────────────────────────────────────────────────

  async listApplications(query: {
    status?: string;
    service?: string;
    country?: string;
    page?: number;
    limit?: number;
  }) {
    const sb = this.supabase.adminClient;
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20);
    const offset = (page - 1) * limit;

    let q = sb
      .from('applications')
      .select(
        'id, user_id, status, current_step, first_name, last_name, designation, ' +
          'headline, bio, linkedin_url, profile_photo_url, firm_name, country, city, ' +
          'primary_service_id, submitted_at, created_at, updated_at, ' +
          're_application_eligible_at',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.status) q = q.eq('status', query.status);
    if (query.service) q = q.eq('primary_service_id', query.service);
    if (query.country) q = q.eq('country', query.country);

    const { data, count, error } = await q;
    if (error) throw new BadRequestException(error.message);

    return {
      data: data ?? [],
      meta: {
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  async getApplication(id: string) {
    const { data, error } = await this.supabase.adminClient
      .from('applications')
      .select(
        'id, user_id, status, current_step, first_name, last_name, designation, headline, bio, ' +
          'linkedin_url, profile_photo_url, firm_name, firm_size, country, city, ' +
          'consultation_fee_min_usd, consultation_fee_max_usd, qualifications, credentials, ' +
          'work_experience, education, primary_service_id, secondary_service_ids, ' +
          'engagements, availability, membership_tier, submitted_at, reviewed_at, ' +
          'rejection_reason, re_application_eligible_at, created_at, updated_at',
      )
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Application not found');
    return data;
  }

  async approveApplication(
    id: string,
    body: { serviceId: string; membershipTier: string },
  ) {
    const sb = this.supabase.adminClient;

    const { data: app } = await sb
      .from('applications')
      .select('id, status, first_name, last_name, user_id')
      .eq('id', id)
      .single();

    if (!app) throw new NotFoundException('Application not found');
    const row = app as any;

    if (!['submitted', 'under_review'].includes(row.status)) {
      throw new BadRequestException(
        'Only submitted or under_review applications can be approved',
      );
    }

    await sb
      .from('applications')
      .update({
        status: 'approved',
        primary_service_id: body.serviceId,
        membership_tier: body.membershipTier,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    const { data: user } = await sb
      .from('users')
      .select('email')
      .eq('id', row.user_id)
      .single();

    const applicantName = `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim();

    await this.email.sendK2ApplicationApproved({
      to: (user as any)?.email ?? '',
      applicantName,
      applicationId: id,
    });

    return { message: 'Application approved' };
  }

  async rejectApplication(id: string, body: { rejectionReason: string }) {
    if (!body.rejectionReason || body.rejectionReason.length < 20) {
      throw new BadRequestException(
        'Rejection reason must be at least 20 characters',
      );
    }

    const sb = this.supabase.adminClient;

    const { data: app } = await sb
      .from('applications')
      .select('id, status, first_name, last_name, user_id')
      .eq('id', id)
      .single();

    if (!app) throw new NotFoundException('Application not found');
    const row = app as any;

    const reEligibleAt = new Date();
    reEligibleAt.setMonth(reEligibleAt.getMonth() + 6);

    await sb
      .from('applications')
      .update({
        status: 'rejected',
        rejection_reason: body.rejectionReason,
        re_application_eligible_at: reEligibleAt.toISOString(),
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    const { data: user } = await sb
      .from('users')
      .select('email')
      .eq('id', row.user_id)
      .single();

    await this.email.sendK3ApplicationRejected({
      to: (user as any)?.email ?? '',
      applicantName: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
      rejectionReason: body.rejectionReason,
    });

    return { message: 'Application rejected' };
  }

  async waitlistApplication(id: string) {
    const sb = this.supabase.adminClient;

    const { data: app } = await sb
      .from('applications')
      .select('id, status, first_name, last_name, user_id')
      .eq('id', id)
      .single();

    if (!app) throw new NotFoundException('Application not found');
    const row = app as any;

    await sb
      .from('applications')
      .update({ status: 'waitlisted', reviewed_at: new Date().toISOString() })
      .eq('id', id);

    const { data: user } = await sb
      .from('users')
      .select('email')
      .eq('id', row.user_id)
      .single();

    await this.email.sendK4ApplicationWaitlisted({
      to: (user as any)?.email ?? '',
      applicantName: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
    });

    return { message: 'Application waitlisted' };
  }

  // ── Members ───────────────────────────────────────────────────────────────

  async listMembers(query: {
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
        'id, first_name, last_name, slug, designation, status, is_verified, ' +
          'is_featured, membership_tier, membership_expiry_at, created_at, ' +
          'pending_service_id, pending_re_verification',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.pendingReVerification) q = q.eq('pending_re_verification', true);
    if (query.pendingServiceChange) q = q.not('pending_service_id', 'is', null);
    if (query.expiringDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + query.expiringDays);
      q = q
        .gte('membership_expiry_at', new Date().toISOString())
        .lte('membership_expiry_at', cutoff.toISOString());
    }

    const { data, count, error } = await q;
    if (error) throw new BadRequestException(error.message);

    return {
      data: data ?? [],
      meta: {
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  async getMember(id: string) {
    const { data, error } = await this.supabase.adminClient
      .from('members')
      .select(
        'id, first_name, last_name, slug, designation, headline, bio, ' +
          'status, is_verified, is_featured, membership_tier, membership_expiry_at, ' +
          'linkedin_url, profile_photo_url, country, city, ' +
          'pending_service_id, pending_re_verification, user_id, created_at',
      )
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Member not found');
    return data;
  }

  async activateMember(
    applicationId: string,
    operator: AuthUser,
    body: { paymentReceivedAt?: string; membershipExpiryAt?: string; paymentReceivedBy?: string },
  ) {
    const sb = this.supabase.adminClient;

    // Step 1: Fetch application
    const { data: app } = await sb
      .from('applications')
      .select(
        'id, status, user_id, first_name, last_name, designation, headline, bio, ' +
          'linkedin_url, profile_photo_url, firm_name, country, city, ' +
          'consultation_fee_min_usd, consultation_fee_max_usd, qualifications, ' +
          'credentials, work_experience, education, primary_service_id, ' +
          'secondary_service_ids, engagements, availability, membership_tier',
      )
      .eq('id', applicationId)
      .single();

    if (!app) throw new NotFoundException('Application not found');
    const a = app as any;

    // Step 1: Validate status = approved
    if (a.status !== 'approved') {
      throw new BadRequestException(
        'Application must be in approved status before activation',
      );
    }

    // Step 2: Validate operator != applicant
    if (operator.dbId === a.user_id) {
      throw new BadRequestException(
        'Operators cannot activate their own application',
      );
    }

    // Step 3: claim_seat atomically via DB function
    const seatClaimed = await this.claimSeat(a.primary_service_id, a.country ?? '');
    if (!seatClaimed) {
      throw new ConflictException(
        'No seats available for this service category. Create a seat first.',
      );
    }

    // Step 4: Generate unique slug
    const baseName = slugify(`${a.first_name ?? ''} ${a.last_name ?? ''}`);
    let slug = baseName;
    for (let i = 0; i < 10; i++) {
      const { data: existing } = await sb
        .from('members')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${baseName}-${randomSuffix()}`;
    }

    // Step 5+6: Compute expiry
    const expiryAt =
      body.membershipExpiryAt ??
      (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        return d.toISOString();
      })();

    // Step 5: Create members record
    const { data: member, error: memberErr } = await sb
      .from('members')
      .insert({
        user_id: a.user_id,
        slug,
        first_name: a.first_name,
        last_name: a.last_name,
        designation: a.designation,
        headline: a.headline,
        bio: a.bio,
        linkedin_url: a.linkedin_url,
        profile_photo_url: a.profile_photo_url,
        firm_name: a.firm_name,
        country: a.country,
        city: a.city,
        consultation_fee_min_usd: a.consultation_fee_min_usd,
        consultation_fee_max_usd: a.consultation_fee_max_usd,
        qualifications: a.qualifications,
        credentials: a.credentials,
        work_experience: a.work_experience,
        education: a.education,
        primary_service_id: a.primary_service_id,
        engagements: a.engagements,
        availability: a.availability,
        membership_tier: a.membership_tier ?? 'budding_entrepreneur',
        status: 'active',
        membership_expiry_at: expiryAt,
        payment_received_at: body.paymentReceivedAt ?? new Date().toISOString(),
        payment_received_by: body.paymentReceivedBy ?? operator.dbId,
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

    const memberId = (member as any).id as string;

    // Step 7: Create member_services
    const serviceIds: string[] = [
      a.primary_service_id,
      ...((a.secondary_service_ids as string[] | null) ?? []),
    ].filter(Boolean);

    for (const serviceId of serviceIds) {
      await sb.from('member_services').insert({
        member_id: memberId,
        service_id: serviceId,
        is_primary: serviceId === a.primary_service_id,
      });
    }

    // Step 8: Update user.role = 'member'
    await sb.from('users').update({ role: 'member' }).eq('id', a.user_id);

    // Step 9: Create notification preferences (all true)
    await sb.from('member_notification_preferences').insert({
      member_id: memberId,
      consultation_requests: true,
      article_status: true,
      membership_reminders: true,
      regulatory_nudges: true,
      platform_updates: true,
    });

    // Step 10: Auto-subscribe to primary category digest
    const { data: svcData } = await sb
      .from('services')
      .select('category_id')
      .eq('id', a.primary_service_id)
      .single();

    if (svcData) {
      await sb.from('member_digest_subscriptions').insert({
        member_id: memberId,
        category_id: (svcData as any).category_id,
        is_subscribed: true,
        frequency: 'weekly',
      });
    }

    // Step 11: Update application status = activated
    await sb
      .from('applications')
      .update({ status: 'activated', activated_at: new Date().toISOString() })
      .eq('id', applicationId);

    // Step 12: Queue embedding
    await this.aiQueue.add(QUEUE_JOB_TYPES.GENERATE_EMBEDDING, {
      entityType: 'member',
      entityId: memberId,
    });

    // Step 13: Invalidate caches
    await this.cache.delByPattern('expertly:members:*');
    await this.cache.delByPattern('expertly:homepage:*');

    // Step 14: ISR revalidate
    try {
      await this.supabase.revalidatePath(`/members/${slug}`);
    } catch (err) {
      this.logger.warn(`ISR revalidation failed: ${(err as Error).message}`);
    }

    // Step 15: Send K17 email
    const { data: userData } = await sb
      .from('users')
      .select('email')
      .eq('id', a.user_id)
      .single();

    await this.email.sendK17MemberActivated({
      to: (userData as any)?.email ?? '',
      memberName: `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim(),
      memberSlug: slug,
    });

    return { memberId, slug };
  }

  private async claimSeat(serviceId: string, country: string): Promise<boolean> {
    const { data, error } = await this.supabase.adminClient.rpc('claim_seat', {
      p_service_id: serviceId,
      p_country: country,
    });
    if (error) {
      this.logger.error('claim_seat RPC error', error);
      return false;
    }
    return !!data;
  }

  async verifyMember(id: string) {
    const sb = this.supabase.adminClient;

    const { data: member } = await sb
      .from('members')
      .select('id, first_name, last_name, user_id')
      .eq('id', id)
      .single();

    if (!member) throw new NotFoundException('Member not found');
    const m = member as any;

    await sb
      .from('members')
      .update({ is_verified: true, verified_at: new Date().toISOString() })
      .eq('id', id);

    const { data: user } = await sb
      .from('users')
      .select('email')
      .eq('id', m.user_id)
      .single();

    await this.email.sendK12VerifiedBadgeAwarded({
      to: (user as any)?.email ?? '',
      memberName: `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim(),
    });

    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Member verified' };
  }

  async suspendMember(id: string) {
    await this.supabase.adminClient
      .from('members')
      .update({ status: 'suspended' })
      .eq('id', id);

    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Member suspended' };
  }

  async updateMemberTier(id: string, body: { tier: string }) {
    const validTiers = ['budding_entrepreneur', 'seasoned_professional'];
    if (!validTiers.includes(body.tier)) {
      throw new BadRequestException(`Invalid tier: ${body.tier}. Must be one of: ${validTiers.join(', ')}`);
    }

    await this.supabase.adminClient
      .from('members')
      .update({ membership_tier: body.tier })
      .eq('id', id);

    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Tier updated' };
  }

  async toggleFeatured(id: string, body: { isFeatured: boolean }) {
    await this.supabase.adminClient
      .from('members')
      .update({ is_featured: body.isFeatured })
      .eq('id', id);

    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Featured status updated' };
  }

  async verifyCredential(
    memberId: string,
    body: { credentialIndex: number; verified: boolean },
  ) {
    const { data: member } = await this.supabase.adminClient
      .from('members')
      .select('credentials')
      .eq('id', memberId)
      .single();

    if (!member) throw new NotFoundException('Member not found');

    const credentials = (((member as any).credentials as any[]) ?? []).slice();
    if (body.credentialIndex >= credentials.length) {
      throw new BadRequestException('Credential index out of range');
    }

    credentials[body.credentialIndex] = {
      ...credentials[body.credentialIndex],
      is_verified: body.verified,
      verified_at: body.verified ? new Date().toISOString() : null,
    };

    await this.supabase.adminClient
      .from('members')
      .update({ credentials })
      .eq('id', memberId);

    return { message: 'Credential updated' };
  }

  async verifyTestimonial(
    memberId: string,
    body: { testimonialIndex: number; verified: boolean },
  ) {
    return { message: 'Testimonial updated', memberId, body };
  }

  async approveServiceChange(id: string) {
    const sb = this.supabase.adminClient;

    const { data: member } = await sb
      .from('members')
      .select('id, first_name, last_name, user_id, pending_service_id')
      .eq('id', id)
      .single();

    if (!member) throw new NotFoundException('Member not found');
    const m = member as any;

    if (!m.pending_service_id) {
      throw new BadRequestException('No pending service change');
    }

    const { data: svc } = await sb
      .from('services')
      .select('name')
      .eq('id', m.pending_service_id)
      .single();

    // Update primary service, clear pending, remove badge
    await sb
      .from('members')
      .update({
        primary_service_id: m.pending_service_id,
        pending_service_id: null,
        is_verified: false,
      })
      .eq('id', id);

    await sb
      .from('member_services')
      .update({ is_primary: false })
      .eq('member_id', id);

    await sb.from('member_services').upsert({
      member_id: id,
      service_id: m.pending_service_id,
      is_primary: true,
    });

    const { data: user } = await sb
      .from('users')
      .select('email')
      .eq('id', m.user_id)
      .single();

    const memberEmail = (user as any)?.email ?? '';
    const memberName = `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim();

    await this.email.sendK19ServiceChangeApproved({
      to: memberEmail,
      memberName,
      newServiceName: (svc as any)?.name ?? '',
    });

    // K11 — badge removed notification
    await this.email.sendK11VerifiedBadgeRemoved({
      to: memberEmail,
      memberName,
      reason:
        'Your service area has changed — re-verification required for the new practice area.',
    });

    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Service change approved' };
  }

  async rejectServiceChange(id: string, body: { rejectionReason: string }) {
    const sb = this.supabase.adminClient;

    const { data: member } = await sb
      .from('members')
      .select('id, first_name, last_name, user_id')
      .eq('id', id)
      .single();

    if (!member) throw new NotFoundException('Member not found');
    const m = member as any;

    await sb
      .from('members')
      .update({ pending_service_id: null })
      .eq('id', id);

    const { data: user } = await sb
      .from('users')
      .select('email')
      .eq('id', m.user_id)
      .single();

    await this.email.sendK20ServiceChangeRejected({
      to: (user as any)?.email ?? '',
      memberName: `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim(),
      rejectionReason: body.rejectionReason,
    });

    return { message: 'Service change rejected' };
  }

  async renewMembership(
    id: string,
    operator: AuthUser,
    body: { paymentReceivedAt?: string; renewalPeriodYears?: number; paymentReceivedBy?: string },
  ) {
    const sb = this.supabase.adminClient;

    const { data: member } = await sb
      .from('members')
      .select('id, first_name, last_name, user_id, membership_expiry_at, status')
      .eq('id', id)
      .single();

    if (!member) throw new NotFoundException('Member not found');
    const m = member as any;

    const years = body.renewalPeriodYears ?? 1;
    const base = m.membership_expiry_at
      ? new Date(m.membership_expiry_at)
      : new Date();
    base.setFullYear(base.getFullYear() + years);
    const newExpiry = base.toISOString();

    await sb
      .from('members')
      .update({
        membership_expiry_at: newExpiry,
        status: 'active',
        renewed_at: new Date().toISOString(),
        payment_received_at: body.paymentReceivedAt ?? new Date().toISOString(),
        payment_received_by: body.paymentReceivedBy ?? operator.dbId,
      })
      .eq('id', id);

    // Step 3: If user role was downgraded to 'user' → restore to 'member'
    await sb
      .from('users')
      .update({ role: 'member' })
      .eq('id', m.user_id)
      .eq('role', 'user');

    const { data: user } = await sb
      .from('users')
      .select('email')
      .eq('id', m.user_id)
      .single();

    const formatted = new Date(newExpiry).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    await this.email.sendK22MembershipRenewed({
      to: (user as any)?.email ?? '',
      memberName: `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim(),
      newExpiryDate: formatted,
    });

    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Membership renewed', newExpiryAt: newExpiry };
  }

  // ── Articles ──────────────────────────────────────────────────────────────

  async listArticles(query: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const sb = this.supabase.adminClient;
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20);
    const offset = (page - 1) * limit;

    let q = sb
      .from('articles')
      .select(
        'id, title, slug, status, author_id, submitted_at, published_at, created_at',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.status) q = q.eq('status', query.status);

    const { data, count, error } = await q;
    if (error) throw new BadRequestException(error.message);

    return {
      data: data ?? [],
      meta: {
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  async approveArticle(id: string) {
    const sb = this.supabase.adminClient;

    const { data: article } = await sb
      .from('articles')
      .select('id, title, slug, body, author_id, status')
      .eq('id', id)
      .single();

    if (!article) throw new NotFoundException('Article not found');
    const a = article as any;

    if (!['submitted', 'under_review'].includes(a.status)) {
      throw new BadRequestException('Only submitted or under_review articles can be approved');
    }

    const newBody = (a.body ?? '') + LEGAL_DISCLAIMER_HTML;

    await sb
      .from('articles')
      .update({
        status: 'published',
        body: newBody,
        published_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Get author
    const { data: member } = await sb
      .from('members')
      .select('first_name, last_name, user_id')
      .eq('id', a.author_id)
      .single();

    const m = member as any;
    const { data: user } = await sb
      .from('users')
      .select('email')
      .eq('id', m?.user_id)
      .single();

    await this.email.sendK9ArticleApproved({
      to: (user as any)?.email ?? '',
      authorName: `${m?.first_name ?? ''} ${m?.last_name ?? ''}`.trim(),
      articleTitle: a.title,
      articleSlug: a.slug,
    });

    // Queue embedding
    await this.aiQueue.add(QUEUE_JOB_TYPES.GENERATE_EMBEDDING, {
      entityType: 'article',
      entityId: id,
    });

    // ISR revalidate
    try {
      await this.supabase.revalidatePath(`/articles/${a.slug}`);
    } catch (err) {
      this.logger.warn(`ISR revalidation failed: ${(err as Error).message}`);
    }

    await this.cache.delByPattern('expertly:articles:*');
    await this.cache.delByPattern('expertly:homepage:*');
    return { message: 'Article approved and published' };
  }

  async rejectArticle(id: string, body: { rejectionReason: string }) {
    const sb = this.supabase.adminClient;

    const { data: article } = await sb
      .from('articles')
      .select('id, title, author_id, status')
      .eq('id', id)
      .single();

    if (!article) throw new NotFoundException('Article not found');
    const a = article as any;

    await sb
      .from('articles')
      .update({ status: 'draft', rejection_reason: body.rejectionReason })
      .eq('id', id);

    const { data: member } = await sb
      .from('members')
      .select('first_name, last_name, user_id')
      .eq('id', a.author_id)
      .single();

    const m = member as any;
    const { data: user } = await sb
      .from('users')
      .select('email')
      .eq('id', m?.user_id)
      .single();

    await this.email.sendK10ArticleRejected({
      to: (user as any)?.email ?? '',
      authorName: `${m?.first_name ?? ''} ${m?.last_name ?? ''}`.trim(),
      articleTitle: a.title,
      rejectionReason: body.rejectionReason,
    });

    return { message: 'Article rejected and returned to draft' };
  }

  async archiveArticle(id: string, body: { reason?: string }) {
    const sb = this.supabase.adminClient;

    const { data: article } = await sb
      .from('articles')
      .select('id, title, author_id')
      .eq('id', id)
      .single();

    if (!article) throw new NotFoundException('Article not found');
    const a = article as any;

    await sb
      .from('articles')
      .update({ status: 'archived', archived_at: new Date().toISOString() })
      .eq('id', id);

    const { data: member } = await sb
      .from('members')
      .select('first_name, last_name, user_id')
      .eq('id', a.author_id)
      .single();

    const m = member as any;
    const { data: user } = await sb
      .from('users')
      .select('email')
      .eq('id', m?.user_id)
      .single();

    await this.email.sendK21ArticleArchived({
      to: (user as any)?.email ?? '',
      authorName: `${m?.first_name ?? ''} ${m?.last_name ?? ''}`.trim(),
      articleTitle: a.title,
      reason: body.reason ?? 'Content policy review',
    });

    await this.cache.delByPattern('expertly:articles:*');
    return { message: 'Article archived' };
  }

  // ── Seats ─────────────────────────────────────────────────────────────────

  async listSeats() {
    const { data, error } = await this.supabase.adminClient
      .from('seats')
      .select(
        'id, category_id, service_id, capacity, claimed_count, is_active, created_at',
      )
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  async createSeat(body: {
    categoryId?: string;
    serviceId?: string;
    capacity: number;
  }) {
    if (!body.categoryId && !body.serviceId) {
      throw new BadRequestException(
        'Either categoryId or serviceId is required',
      );
    }

    const { data, error } = await this.supabase.adminClient
      .from('seats')
      .insert({
        category_id: body.categoryId,
        service_id: body.serviceId,
        capacity: body.capacity,
        claimed_count: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async updateSeat(id: string, body: { capacity?: number; isActive?: boolean }) {
    const update: Record<string, unknown> = {};
    if (body.capacity !== undefined) update.capacity = body.capacity;
    if (body.isActive !== undefined) update.is_active = body.isActive;

    const { data, error } = await this.supabase.adminClient
      .from('seats')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ── Events ────────────────────────────────────────────────────────────────

  async createEvent(body: Record<string, unknown>) {
    const { data, error } = await this.supabase.adminClient
      .from('events')
      .insert(body)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    await this.aiQueue.add(QUEUE_JOB_TYPES.GENERATE_EMBEDDING, {
      entityType: 'event',
      entityId: (data as any).id,
    });

    await this.cache.delByPattern('expertly:events:*');
    return data;
  }

  async updateEvent(id: string, body: Record<string, unknown>) {
    const { data, error } = await this.supabase.adminClient
      .from('events')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    await this.cache.delByPattern('expertly:events:*');
    return data;
  }

  async deleteEvent(id: string) {
    const { error } = await this.supabase.adminClient
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    await this.cache.delByPattern('expertly:events:*');
    return { message: 'Event deleted' };
  }

  // ── Broadcast ─────────────────────────────────────────────────────────────

  async broadcast(body: {
    subject: string;
    message: string;
    roles?: string[];
  }) {
    const sb = this.supabase.adminClient;

    let q = sb.from('users').select('id, email, role').eq('is_active', true);
    if (body.roles?.length) q = q.in('role', body.roles);

    const { data: users } = await q;
    if (!users) return { sent: 0 };

    let sent = 0;
    for (const user of users as any[]) {
      try {
        await this.email.sendEmail('K15', user.email, {
          memberName: '',
          categoryName: body.subject,
          articles: [],
        });
        sent++;
      } catch (_) {
        // continue on individual failure
      }
    }

    await sb.from('broadcast_logs').insert({
      subject: body.subject,
      message: body.message,
      recipient_count: sent,
      sent_at: new Date().toISOString(),
    });

    return { sent };
  }

  async getBroadcastLogs() {
    const { data } = await this.supabase.adminClient
      .from('broadcast_logs')
      .select('id, subject, message, recipient_count, sent_at')
      .order('sent_at', { ascending: false })
      .limit(50);

    return data ?? [];
  }
}
