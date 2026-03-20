import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmailService } from '../../common/services/email.service';
import { AuthUser } from '@expertly/types';
import { Step1Dto } from './dto/step-1.dto';
import { Step2Dto } from './dto/step-2.dto';
import { Step3Dto } from './dto/step-3.dto';
import { Step4Dto } from './dto/step-4.dto';
import { SubmitDto } from './dto/submit.dto';

const APPLICATION_SELECT =
  'id, user_id, status, current_step, first_name, last_name, designation, headline, bio, ' +
  'linkedin_url, profile_photo_url, region, country, state, phone_extension, phone, contact_email, ' +
  'years_of_experience, firm_name, firm_size, website_url, city, ' +
  'consultation_fee_min_usd, consultation_fee_max_usd, qualifications, credentials, ' +
  'work_experience, education, primary_service_id, secondary_service_ids, ' +
  'key_engagements, engagements, availability, ' +
  'motivation_why, motivation_engagement, motivation_unique, ' +
  'consents, creation_mode, submitted_at, ' +
  're_application_eligible_at, created_at, updated_at';

type ApplicationRow = {
  id: string;
  user_id: string;
  status: string;
  current_step: number;
  first_name?: string | null;
  last_name?: string | null;
  country?: string | null;
  primary_service_id?: string | null;
  re_application_eligible_at?: string | null;
  [key: string]: unknown;
};

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly email: EmailService,
  ) {}

  // ─── Get My Latest Application ────────────────────────────────────────────

  async getMe(user: AuthUser): Promise<unknown> {
    const { data, error } = await this.supabase.adminClient
      .from('applications')
      .select(APPLICATION_SELECT)
      .eq('user_id', user.dbId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // ─── Create or Resume Draft ───────────────────────────────────────────────

  async createOrResume(user: AuthUser): Promise<unknown> {
    // Get latest application for this user
    const { data: latest, error } = await this.supabase.adminClient
      .from('applications')
      .select(APPLICATION_SELECT)
      .eq('user_id', user.dbId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (latest) {
      const app = latest as unknown as ApplicationRow;

      switch (app.status) {
        case 'draft':
          return app; // Return existing draft

        case 'submitted':
        case 'under_review':
          throw new ConflictException('APPLICATION_UNDER_REVIEW');

        case 'approved':
          throw new ConflictException('APPLICATION_APPROVED');

        case 'waitlisted':
          throw new ConflictException('APPLICATION_WAITLISTED');

        case 'rejected': {
          const eligibleAt = app.re_application_eligible_at;
          if (!eligibleAt || new Date(eligibleAt) > new Date()) {
            throw new ConflictException({
              message: 'REAPPLICATION_TOO_SOON',
              eligibleAt,
            });
          }
          // Eligible to re-apply — fall through to create new draft
          break;
        }
      }
    }

    // Create new draft
    const { data: newApp, error: createError } = await this.supabase.adminClient
      .from('applications')
      .insert({ user_id: user.dbId, status: 'draft', current_step: 0 })
      .select(APPLICATION_SELECT)
      .single();

    if (createError) throw createError;
    return newApp;
  }

  // ─── Step 1: Identity ────────────────────────────────────────────────────

  async updateStep1(
    user: AuthUser,
    id: string,
    dto: Step1Dto,
  ): Promise<unknown> {
    const app = await this.findOwnedDraft(user, id);

    // Step enforcement
    const nextStep = 1;
    if (nextStep > app.current_step + 1) {
      throw new BadRequestException('Complete previous steps first');
    }

    const payload: Record<string, unknown> = {
      first_name: dto.firstName,
      last_name: dto.lastName,
      designation: dto.designation,
      headline: dto.headline,
      bio: dto.bio,
      linkedin_url: dto.linkedinUrl,
      profile_photo_url: dto.profilePhotoUrl,
      region: dto.region,
      country: dto.country,
      state: dto.state,
      city: dto.city,
      phone_extension: dto.phoneExtension,
      phone: dto.phone,
      contact_email: dto.contactEmail,
    };

    // Remove undefined values
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    if (app.current_step < nextStep) {
      payload.current_step = nextStep;
    }

    const { data, error } = await this.supabase.adminClient
      .from('applications')
      .update(payload)
      .eq('id', id)
      .select(APPLICATION_SELECT)
      .single();

    if (error) throw error;
    return data;
  }

  // ─── Step 2: Experience ───────────────────────────────────────────────────

  async updateStep2(
    user: AuthUser,
    id: string,
    dto: Step2Dto,
  ): Promise<unknown> {
    const app = await this.findOwnedDraft(user, id);

    const nextStep = 2;
    if (nextStep > app.current_step + 1) {
      throw new BadRequestException('Complete previous steps first');
    }

    const payload: Record<string, unknown> = {
      years_of_experience: dto.yearsOfExperience,
      firm_name: dto.firmName,
      firm_size: dto.firmSize,
      website_url: dto.firmWebsiteUrl,
      consultation_fee_min_usd: dto.consultationFeeMinUsd,
      consultation_fee_max_usd: dto.consultationFeeMaxUsd,
      qualifications: dto.qualifications,
      credentials: dto.credentials,
      work_experience: dto.workExperience,
      education: dto.education,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    if (app.current_step < nextStep) {
      payload.current_step = nextStep;
    }

    const { data, error } = await this.supabase.adminClient
      .from('applications')
      .update(payload)
      .eq('id', id)
      .select(APPLICATION_SELECT)
      .single();

    if (error) throw error;
    return data;
  }

  // ─── Step 3: Services + Availability ─────────────────────────────────────

  async updateStep3(
    user: AuthUser,
    id: string,
    dto: Step3Dto,
  ): Promise<unknown> {
    const app = await this.findOwnedDraft(user, id);

    const nextStep = 3;
    if (nextStep > app.current_step + 1) {
      throw new BadRequestException('Complete previous steps first');
    }

    const payload: Record<string, unknown> = {
      primary_service_id: dto.primaryServiceId,
      secondary_service_ids: dto.secondaryServiceIds,
      key_engagements: dto.keyEngagements,
      engagements: dto.engagements,
      availability: dto.availability,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    if (app.current_step < nextStep) {
      payload.current_step = nextStep;
    }

    const { data, error } = await this.supabase.adminClient
      .from('applications')
      .update(payload)
      .eq('id', id)
      .select(APPLICATION_SELECT)
      .single();

    if (error) throw error;
    return data;
  }

  // ─── Step 4: Motivation ───────────────────────────────────────────────────

  async updateStep4(
    user: AuthUser,
    id: string,
    dto: Step4Dto,
  ): Promise<unknown> {
    const app = await this.findOwnedDraft(user, id);

    const nextStep = 4;
    if (nextStep > app.current_step + 1) {
      throw new BadRequestException('Complete previous steps first');
    }

    const payload: Record<string, unknown> = {
      motivation_why: dto.motivationWhy,
      motivation_engagement: dto.motivationEngagement,
      motivation_unique: dto.motivationUnique,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    if (app.current_step < nextStep) {
      payload.current_step = nextStep;
    }

    const { data, error } = await this.supabase.adminClient
      .from('applications')
      .update(payload)
      .eq('id', id)
      .select(APPLICATION_SELECT)
      .single();

    if (error) throw error;
    return data;
  }

  // ─── Submit Application ───────────────────────────────────────────────────

  async submit(user: AuthUser, id: string, dto: SubmitDto): Promise<unknown> {
    const app = await this.findOwnedDraft(user, id);

    // Validate all 4 steps complete
    if (app.current_step < 4) {
      throw new BadRequestException('All 4 steps must be completed before submitting');
    }

    // Validate required fields
    if (!app.first_name || !app.last_name) {
      throw new BadRequestException('First and last name are required');
    }
    if (!app.country) {
      throw new BadRequestException('Country is required');
    }
    if (!app.primary_service_id) {
      throw new BadRequestException('Primary service is required');
    }

    // Validate all required consents are present
    const required = ['terms_of_service', 'privacy_policy', 'credential_verification'] as const;
    for (const key of required) {
      if (!dto.consents[key]?.accepted_at) {
        throw new BadRequestException(`Consent '${key}' is required`);
      }
    }

    const { data, error } = await this.supabase.adminClient
      .from('applications')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        consents: dto.consents,
      })
      .eq('id', id)
      .select(APPLICATION_SELECT)
      .single();

    if (error) throw error;

    // Get user email for K1
    const { data: userData } = await this.supabase.adminClient
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', user.dbId)
      .single();

    if (userData) {
      const u = userData as { email: string; first_name: string; last_name: string };
      await this.email.sendK1ApplicationSubmitted({
        applicantName: `${u.first_name} ${u.last_name}`.trim() || (app.first_name ?? ''),
        applicantEmail: u.email,
        applicationId: id,
      });
    }

    return data;
  }

  // ─── Helper: find owned draft ─────────────────────────────────────────────

  private async findOwnedDraft(user: AuthUser, id: string): Promise<ApplicationRow> {
    const { data, error } = await this.supabase.adminClient
      .from('applications')
      .select(APPLICATION_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundException(`Application '${id}' not found`);

    const app = data as unknown as ApplicationRow;
    if (app.user_id !== user.dbId) {
      throw new ForbiddenException('Access denied');
    }
    if (app.status !== 'draft') {
      throw new BadRequestException('Application is not in draft status');
    }

    return app;
  }
}
