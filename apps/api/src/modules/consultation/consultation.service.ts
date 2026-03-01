import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmailService } from '../../common/services/email.service';
import { AuthUser } from '@expertly/types';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationStatusDto } from './dto/update-status.dto';

const CONSULTATION_FIELDS =
  'id, requester_id, member_id, service_id, subject, description, preferred_time, ' +
  'status, created_at, updated_at';

type ConsultationRow = {
  id: string;
  requester_id: string;
  member_id: string;
  status: string;
  [key: string]: unknown;
};

@Injectable()
export class ConsultationService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly email: EmailService,
  ) {}

  async create(user: AuthUser, dto: CreateConsultationDto): Promise<unknown> {
    // Check member is active
    const { data: member, error: memberErr } = await this.supabase.adminClient
      .from('members')
      .select('id, membership_status, users!user_id(email, first_name, last_name)')
      .eq('id', dto.memberId)
      .eq('membership_status', 'active')
      .maybeSingle();

    if (memberErr) throw memberErr;
    if (!member) throw new NotFoundException('Member not found or not active');

    // Check duplicate request in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await this.supabase.adminClient
      .from('consultation_requests')
      .select('id', { count: 'exact', head: true })
      .eq('requester_id', user.dbId)
      .eq('member_id', dto.memberId)
      .gte('created_at', sevenDaysAgo);

    if ((count ?? 0) > 0) {
      throw new ConflictException('DUPLICATE_REQUEST');
    }

    // Insert request
    const { data, error } = await this.supabase.adminClient
      .from('consultation_requests')
      .insert({
        requester_id: user.dbId,
        member_id: dto.memberId,
        service_id: dto.serviceId ?? null,
        subject: dto.subject,
        description: dto.description ?? null,
        preferred_time: dto.preferredTime ?? null,
        status: 'pending',
      })
      .select(CONSULTATION_FIELDS)
      .single();

    if (error) throw error;

    // Get requester info
    const { data: requesterData } = await this.supabase.adminClient
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', user.dbId)
      .single();

    const memberObj = member as Record<string, unknown>;
    const memberUser = memberObj.users as { email: string; first_name: string; last_name: string } | null;
    const requester = requesterData as { email: string; first_name: string; last_name: string } | null;

    if (memberUser && requester) {
      // K6 — to member
      await this.email.sendK6ConsultationReceived({
        memberEmail: memberUser.email,
        memberName: `${memberUser.first_name} ${memberUser.last_name}`.trim(),
        requesterEmail: requester.email,
        requesterName: `${requester.first_name} ${requester.last_name}`.trim(),
        subject: dto.subject,
      });

      // K7 — to requester
      await this.email.sendK7ConsultationConfirmation({
        requesterEmail: requester.email,
        requesterName: `${requester.first_name} ${requester.last_name}`.trim(),
        memberName: `${memberUser.first_name} ${memberUser.last_name}`.trim(),
        subject: dto.subject,
      });
    }

    return data;
  }

  async getReceived(user: AuthUser): Promise<unknown[]> {
    if (!user.memberId) return [];

    const { data, error } = await this.supabase.adminClient
      .from('consultation_requests')
      .select(CONSULTATION_FIELDS)
      .eq('member_id', user.memberId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data ?? [];
  }

  async getSent(user: AuthUser): Promise<unknown[]> {
    const { data, error } = await this.supabase.adminClient
      .from('consultation_requests')
      .select(CONSULTATION_FIELDS)
      .eq('requester_id', user.dbId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data ?? [];
  }

  async updateStatus(
    user: AuthUser,
    id: string,
    dto: UpdateConsultationStatusDto,
  ): Promise<unknown> {
    if (!user.memberId) throw new ForbiddenException('Member access required');

    const { data: existing, error: fetchErr } = await this.supabase.adminClient
      .from('consultation_requests')
      .select(CONSULTATION_FIELDS)
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!existing) throw new NotFoundException(`Consultation request '${id}' not found`);

    const row = existing as unknown as ConsultationRow;
    if (row.member_id !== user.memberId) {
      throw new ForbiddenException('Access denied');
    }

    const { data, error } = await this.supabase.adminClient
      .from('consultation_requests')
      .update({ status: dto.status })
      .eq('id', id)
      .select(CONSULTATION_FIELDS)
      .single();

    if (error) throw error;
    return data;
  }
}
