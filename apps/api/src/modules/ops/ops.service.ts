import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { SupabaseService } from '../../common/services/supabase.service';
import { MEMBER_TIERS } from '@expertly/utils';
import { CacheService } from '../../common/services/cache.service';
import { EmailService } from '../../common/services/email.service';
import { AuthUser } from '@expertly/types';
import { slugify, randomSuffix } from '@expertly/utils';
import {
  QUEUE_NAMES,
  QUEUE_JOB_TYPES,
  getQueueConnection,
  isQueueDisabled,
} from '../../config/queue.config';
import { RssProcessor } from '../rss/rss.processor';

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
  private readonly aiQueue: Queue | null;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly cache: CacheService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
    private readonly rss: RssProcessor,
  ) {
    this.aiQueue = isQueueDisabled(config)
      ? null
      : new Queue(QUEUE_NAMES.AI, { connection: getQueueConnection(config) });
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
          'linkedin_url, profile_photo_url, profile_photo_base64, ' +
          'region, state, city, country, phone_extension, phone, contact_email, ' +
          'years_of_experience, firm_name, firm_size, website_url, ' +
          'consultation_fee_min_usd, consultation_fee_max_usd, qualifications, credentials, ' +
          'work_experience, education, primary_service_id, secondary_service_ids, ' +
          'key_engagements, engagements, availability, ' +
          'motivation_why, motivation_engagement, motivation_unique, ' +
          'membership_tier, submitted_at, reviewed_at, ' +
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
      firstName: row.first_name ?? undefined,
      lastName: row.last_name ?? undefined,
      serviceAssigned: body.serviceId,
      tier: body.membershipTier,
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

    // Flatten user.first_name / user.last_name to top level
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
        'id, slug, designation, headline, bio, ' +
          'membership_status, is_verified, is_featured, member_tier, ' +
          'membership_start_date, membership_expiry_date, ' +
          'linkedin_url, profile_photo_url, profile_photo_base64, ' +
          'country, city, region, state, ' +
          'contact_phone, contact_email, firm_name, firm_size, website, ' +
          'years_of_experience, consultation_fee_min_usd, consultation_fee_max_usd, ' +
          'qualifications, credentials, work_experience, education, testimonials, engagements, ' +
          'primary_service_id, key_engagements, ' +
          'motivation_why, motivation_engagement, motivation_unique, ' +
          'pending_service_change, re_verification_requested_at, user_id, created_at, updated_at, ' +
          'user:users!user_id(first_name, last_name, email)',
      )
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Member not found');

    const { user, membership_expiry_date, ...m } = data as unknown as {
      user: { first_name: string; last_name: string; email: string } | null;
      membership_expiry_date: string | null;
      [key: string]: unknown;
    };
    return {
      ...m,
      // Rename to match frontend interface (membershipExpiryAt after camelCase conversion)
      membership_expiry_at: membership_expiry_date,
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
    };
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
          'linkedin_url, profile_photo_url, firm_name, firm_size, website_url, region, country, state, ' +
          'phone_extension, phone, contact_email, city, ' +
          'years_of_experience, consultation_fee_min_usd, consultation_fee_max_usd, qualifications, ' +
          'credentials, work_experience, education, primary_service_id, ' +
          'secondary_service_ids, key_engagements, engagements, availability, ' +
          'motivation_why, motivation_engagement, motivation_unique',
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

    // Step 3: Generate unique slug
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
        firm_size: a.firm_size,
        website: a.website_url,
        region: a.region,
        country: a.country,
        state: a.state,
        city: a.city,
        contact_phone: a.phone_extension && a.phone ? `${a.phone_extension} ${a.phone}` : (a.phone ?? null),
        contact_email: a.contact_email,
        years_of_experience: a.years_of_experience,
        consultation_fee_min_usd: a.consultation_fee_min_usd,
        consultation_fee_max_usd: a.consultation_fee_max_usd,
        qualifications: a.qualifications,
        credentials: a.credentials,
        work_experience: a.work_experience,
        education: a.education,
        primary_service_id: a.primary_service_id,
        key_engagements: a.key_engagements ?? [],
        engagements: a.engagements,
        availability: a.availability,
        motivation_why: a.motivation_why,
        motivation_engagement: a.motivation_engagement,
        motivation_unique: a.motivation_unique,
        member_tier: 'budding_entrepreneur',
        membership_status: 'active',
        membership_start_date: new Date().toISOString().split('T')[0],
        membership_expiry_date: expiryAt,
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
    await this.aiQueue?.add(QUEUE_JOB_TYPES.GENERATE_EMBEDDING, {
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
      .update({ membership_status: 'suspended' })
      .eq('id', id);

    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Member suspended' };
  }

  async updateMemberTier(id: string, body: { tier: string }) {
    const validTiers: readonly string[] = MEMBER_TIERS;
    if (!validTiers.includes(body.tier)) {
      throw new BadRequestException(`Invalid tier: ${body.tier}. Must be one of: ${MEMBER_TIERS.join(', ')}`);
    }

    await this.supabase.adminClient
      .from('members')
      .update({ member_tier: body.tier })
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
    await this.cache.delByPattern('expertly:homepage:*');
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
    body: {
      paymentReceivedAt?: string;
      renewalPeriodYears?: number;
      paymentReceivedBy?: string;
      membershipExpiryAt?: string;
    },
  ) {
    const sb = this.supabase.adminClient;

    const { data: member } = await sb
      .from('members')
      .select('id, user_id, membership_expiry_date, membership_status, user:users!user_id(first_name, last_name)')
      .eq('id', id)
      .single();

    if (!member) throw new NotFoundException('Member not found');
    const m = member as any;

    let newExpiry: string;
    if (body.membershipExpiryAt) {
      newExpiry = new Date(body.membershipExpiryAt).toISOString();
    } else {
      const years = body.renewalPeriodYears ?? 1;
      const base = m.membership_expiry_date
        ? new Date(m.membership_expiry_date)
        : new Date();
      base.setFullYear(base.getFullYear() + years);
      newExpiry = base.toISOString();
    }

    await sb
      .from('members')
      .update({
        membership_expiry_date: newExpiry,
        membership_status: 'active',
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
      .select('email, first_name, last_name')
      .eq('id', m.user_id)
      .single();

    const formatted = new Date(newExpiry).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const u = user as any;
    await this.email.sendK22MembershipRenewed({
      to: u?.email ?? '',
      memberName: `${u?.first_name ?? ''} ${u?.last_name ?? ''}`.trim(),
      newExpiryDate: formatted,
    });

    await this.cache.delByPattern('expertly:members:*');
    return { message: 'Membership renewed', newExpiryAt: newExpiry };
  }

  // ── Ops Users ──────────────────────────────────────────────────────────────

  async listOpsUsers() {
    const { data, error } = await this.supabase.adminClient
      .from('users')
      .select('id, email, first_name, last_name, role')
      .in('role', ['ops', 'backend_admin'])
      .order('first_name', { ascending: true });

    if (error) throw new BadRequestException(error.message);
    return data ?? [];
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
        'id, title, slug, excerpt, status, author_id, category_id, tags, ' +
          'creation_mode, submitted_at, published_at, rejection_reason, created_at',
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

  async getArticle(id: string) {
    const { data, error } = await this.supabase.adminClient
      .from('articles')
      .select(
        'id, title, slug, body, excerpt, status, author_id, category_id, tags, ' +
          'creation_mode, submitted_at, published_at, rejection_reason, created_at, updated_at, ' +
          'author:members!author_id(designation, user:users!user_id(first_name, last_name, email))',
      )
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Article not found');

    const { author, ...a } = data as unknown as {
      author: { designation?: string; user: { first_name?: string; last_name?: string; email?: string } | null } | null;
      [key: string]: unknown;
    };

    return {
      ...a,
      author_name: author?.user
        ? `${author.user.first_name ?? ''} ${author.user.last_name ?? ''}`.trim()
        : null,
      author_email: author?.user?.email ?? null,
      author_designation: author?.designation ?? null,
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

    // Generate AI summary before persisting (use original body, not with disclaimer)
    let aiSummary: string | null = null;
    const anthropicKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (anthropicKey) {
      try {
        const plainText = (a.body ?? '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&[a-z]+;/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 3000);
        const { text } = await generateText({
          model: createAnthropic({ apiKey: anthropicKey })('claude-haiku-4-5-20251001'),
          prompt: `Write a 2-3 sentence summary of this article. Be concise and factual. Do not start with "This article" or "The article".\n\n${plainText}`,
        });
        aiSummary = text.trim();
      } catch (err) {
        this.logger.warn(`AI summary generation failed: ${(err as Error).message}`);
      }
    }

    await sb
      .from('articles')
      .update({
        status: 'published',
        body: newBody,
        published_at: new Date().toISOString(),
        ...(aiSummary ? { ai_summary: aiSummary } : {}),
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

    // Check notification preference before sending
    const { data: notifPref } = await sb
      .from('member_notification_preferences')
      .select('article_status')
      .eq('member_id', a.author_id)
      .maybeSingle() as { data: { article_status: boolean } | null };

    const articleStatusEnabled = notifPref?.article_status ?? true; // default on if no row
    if (articleStatusEnabled && (user as any)?.email) {
      await this.email.sendK9ArticleApproved({
        to: (user as any).email,
        authorName: `${m?.first_name ?? ''} ${m?.last_name ?? ''}`.trim(),
        articleTitle: a.title,
        articleSlug: a.slug,
      });
    }

    // Queue embedding with high priority (1) per spec
    await this.aiQueue?.add(
      QUEUE_JOB_TYPES.GENERATE_EMBEDDING,
      { entityType: 'article', entityId: id },
      { priority: 1 },
    );

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

  async rejectArticle(id: string, body: { reason?: string; rejectionReason?: string }) {
    const sb = this.supabase.adminClient;

    const { data: article } = await sb
      .from('articles')
      .select('id, title, author_id, status')
      .eq('id', id)
      .single();

    if (!article) throw new NotFoundException('Article not found');
    const a = article as any;

    const reason = body.reason ?? body.rejectionReason ?? '';

    await sb
      .from('articles')
      .update({ status: 'draft', rejection_reason: reason })
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

    // Check notification preference before sending
    const { data: notifPref } = await sb
      .from('member_notification_preferences')
      .select('article_status')
      .eq('member_id', a.author_id)
      .maybeSingle() as { data: { article_status: boolean } | null };

    const articleStatusEnabled = notifPref?.article_status ?? true;
    if (articleStatusEnabled && (user as any)?.email) {
      await this.email.sendK10ArticleRejected({
        to: (user as any).email,
        authorName: `${m?.first_name ?? ''} ${m?.last_name ?? ''}`.trim(),
        articleTitle: a.title,
        rejectionReason: reason,
      });
    }

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

  // ── Events ────────────────────────────────────────────────────────────────

  async importEvents(buffer: Buffer, filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext ?? '')) {
      throw new BadRequestException('File must be .xlsx, .xls or .csv');
    }

    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
    });

    if (rows.length === 0) throw new BadRequestException('Spreadsheet is empty');

    const created: string[] = [];
    const errors: { row: number; error: string }[] = [];

    // Normalise a header like "Start Date" / "start_date" / "startDate" → canonical key
    const normalise = (v: unknown) =>
      String(v ?? '')
        .toLowerCase()
        .replace(/[\s_-]+/g, '');

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      // Build a lookup keyed by normalised column name
      const r: Record<string, string> = {};
      for (const [k, v] of Object.entries(raw)) {
        r[normalise(k)] = String(v ?? '').trim();
      }

      const title = r['title'] ?? r['eventname'] ?? r['name'] ?? '';
      const startDate = r['startdate'] ?? r['start'] ?? '';

      if (!title) {
        errors.push({ row: i + 2, error: 'Missing required field: title' });
        continue;
      }
      if (!startDate) {
        errors.push({ row: i + 2, error: 'Missing required field: start date' });
        continue;
      }

      // Parse date — accept ISO strings or Excel date serials
      const parsedStart = new Date(startDate);
      if (isNaN(parsedStart.getTime())) {
        errors.push({ row: i + 2, error: `Invalid start date: "${startDate}"` });
        continue;
      }

      const endDateStr = r['enddate'] ?? r['end'] ?? '';
      const parsedEnd = endDateStr ? new Date(endDateStr) : null;

      const format = r['format'] ?? r['eventformat'] ?? 'online';
      const tags = (r['tags'] ?? '')
        .split(/[,;]/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const slug = slugify(title) + '-' + randomSuffix();

      const ne = (v: string) => v || null; // empty string → null
      const row: Record<string, unknown> = {
        slug,
        title,
        short_description: ne(r['shortdescription'] ?? r['shortdesc'] ?? ''),
        description: r['description'] ?? r['desc'] ?? '',
        event_format: ['online', 'in_person', 'hybrid'].includes(format)
          ? format
          : 'online',
        country: ne(r['country'] ?? ''),
        city: ne(r['city'] ?? ''),
        venue_name: ne(r['venue'] ?? r['venuename'] ?? ''),
        start_date: parsedStart.toISOString(),
        end_date: parsedEnd?.toISOString() ?? null,
        registration_url: ne(r['registrationurl'] ?? r['url'] ?? ''),
        cover_image_url: ne(r['coverimageurl'] ?? r['image'] ?? ''),
        tags,
        is_published: ['true', 'yes', '1'].includes(
          (r['ispublished'] ?? r['published'] ?? '').toLowerCase(),
        ),
        source: 'ops_import',
      };

      try {
        const { data, error } = await this.supabase.adminClient
          .from('events')
          .insert(row)
          .select('id, title')
          .single();

        if (error) throw new Error(error.message);
        created.push((data as any).id);
      } catch (err) {
        errors.push({ row: i + 2, error: (err as Error).message });
      }
    }

    await this.cache.delByPattern('expertly:events:*');

    return {
      imported: created.length,
      failed: errors.length,
      errors,
    };
  }

  async listEvents() {
    const { data, error } = await this.supabase.adminClient
      .from('events')
      .select(
        'id, slug, title, short_description, description, event_format, ' +
          'country, city, venue_name, start_date, end_date, ' +
          'registration_url, cover_image_url, is_published, is_featured, tags, ' +
          'created_at, updated_at',
      )
      .order('start_date', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  async createEvent(body: Record<string, unknown>) {
    // Map camelCase frontend fields to snake_case DB columns
    const slug = slugify(String(body.title ?? '')) + '-' + randomSuffix();
    const row: Record<string, unknown> = {
      slug,
      title: body.title,
      short_description: body.shortDescription ?? null,
      description: body.description ?? '',
      event_format: body.format ?? 'online',
      country: body.country ?? null,
      city: body.city ?? null,
      venue_name: body.venue ?? null,
      start_date: body.startDate,
      end_date: body.endDate ?? null,
      registration_url: body.registrationUrl ?? null,
      cover_image_url: body.coverImageUrl ?? null,
      tags: body.tags ?? [],
      is_published: body.isPublished ?? false,
      source: 'ops',
    };

    const { data, error } = await this.supabase.adminClient
      .from('events')
      .insert(row)
      .select('id, slug, title, short_description, event_format, country, city, start_date, is_published')
      .single();

    if (error) throw new BadRequestException(error.message);

    await this.aiQueue?.add(QUEUE_JOB_TYPES.GENERATE_EMBEDDING, {
      entityType: 'event',
      entityId: (data as any).id,
    });

    await this.cache.delByPattern('expertly:events:*');
    return data;
  }

  async publishEvent(id: string, isPublished: boolean) {
    const { data, error } = await this.supabase.adminClient
      .from('events')
      .update({ is_published: isPublished })
      .eq('id', id)
      .select('id, is_published')
      .single();

    if (error || !data) throw new BadRequestException(error?.message ?? 'Event not found');
    await this.cache.delByPattern('expertly:events:*');
    return data;
  }

  async updateEvent(id: string, body: Record<string, unknown>) {
    // Map camelCase frontend fields to snake_case DB columns
    const updates: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      title: 'title',
      shortDescription: 'short_description',
      description: 'description',
      format: 'event_format',
      country: 'country',
      city: 'city',
      venue: 'venue_name',
      startDate: 'start_date',
      endDate: 'end_date',
      registrationUrl: 'registration_url',
      coverImageUrl: 'cover_image_url',
      isPublished: 'is_published',
      isFeatured: 'is_featured',
      tags: 'tags',
    };
    for (const [camel, snake] of Object.entries(fieldMap)) {
      if (camel in body) updates[snake] = body[camel];
    }

    const { data, error } = await this.supabase.adminClient
      .from('events')
      .update(updates)
      .eq('id', id)
      .select('id, slug, title, short_description, event_format, country, city, start_date, is_published')
      .single();

    if (error) throw new BadRequestException(error.message);
    await this.cache.delByPattern('expertly:events:*');

    const embeddableFields = ['title', 'description', 'format', 'country', 'city'];
    if (embeddableFields.some((f) => f in body)) {
      await this.aiQueue?.add(
        QUEUE_JOB_TYPES.GENERATE_EMBEDDING,
        { entityType: 'event', entityId: id },
        { jobId: `embed:event:${id}` },
      );
    }

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

  // ── Regulatory Updates ────────────────────────────────────────────────────

  async getRegulatoryUpdates() {
    const { data } = await this.supabase.adminClient
      .from('regulatory_updates')
      .select(
        'id, title, summary, source_url, relevant_regions, published_date, created_at, nudges_sent',
      )
      .order('created_at', { ascending: false })
      .limit(100);

    return (data ?? []).map((u: Record<string, unknown>) => ({
      id: u['id'],
      title: u['title'],
      summary: u['summary'] ?? null,
      source_url: u['source_url'] ?? null,
      region: ((u['relevant_regions'] as string[] | null) ?? [])[0] ?? null,
      published_at: u['published_date'] ?? null,
      created_at: u['created_at'],
      nudges_sent: u['nudges_sent'] ?? 0,
    }));
  }

  async triggerRssIngestion() {
    return this.rss.triggerDirectIngest();
  }
}
