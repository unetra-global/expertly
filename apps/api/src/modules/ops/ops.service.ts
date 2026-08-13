import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmailService } from '../../common/services/email.service';

@Injectable()
export class OpsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly email: EmailService,
  ) {}

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
