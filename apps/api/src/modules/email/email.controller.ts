import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsString, IsOptional, IsIn } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@expertly/types';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { EmailService } from '../../common/services/email.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { DigestProcessor } from './digest.processor';
import { Public } from '../../common/decorators/public.decorator';
import {
  QUEUE_NAMES,
  QUEUE_JOB_TYPES,
  getQueueConnection,
  isQueueDisabled,
} from '../../config/queue.config';

class TestEmailDto {
  @IsEmail()
  to!: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

class TriggerDigestDto {
  @IsString()
  @IsOptional()
  date?: string; // YYYY-MM-DD; defaults to yesterday
}

class PreviewNotificationDto {
  /** article_status | regulatory_nudges | platform_updates */
  @IsIn(['article_status', 'regulatory_nudges', 'platform_updates'])
  type!: string;
}

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    private readonly digestProcessor: DigestProcessor,
    private readonly supabase: SupabaseService,
  ) {}

  /**
   * POST /email/test
   * Sends a test email via the configured SMTP transport.
   * Used to verify SMTP credentials before going live.
   */
  @Public()
  @Post('test')
  @HttpCode(200)
  async testEmail(@Body() dto: TestEmailDto): Promise<{ ok: boolean; message: string }> {
    const subject = dto.subject ?? 'Expertly — SMTP Test';
    const body = dto.message ?? 'This is a test email sent from the Expertly platform to verify SMTP configuration.';

    await this.emailService.sendRaw({
      to: dto.to,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h2 style="color:#1e3a5f;">SMTP Test — Expertly</h2>
          <p style="color:#334155;font-size:15px;line-height:1.6;">${body}</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
          <p style="color:#94a3b8;font-size:12px;">
            Sent from: <strong>${process.env['SMTP_USER'] ?? 'unknown'}</strong>
            via <strong>${process.env['SMTP_HOST'] ?? 'unknown'}:${process.env['SMTP_PORT'] ?? '587'}</strong>
          </p>
        </div>
      `,
    });

    return { ok: true, message: `Test email sent to ${dto.to}` };
  }

  /**
   * POST /email/trigger/guest-newsletter
   * Manually fires the guest newsletter for a given date (default: yesterday).
   * Runs directly (no queue) so it works even when REDIS_DISABLED=true.
   */
  @Public()
  @Post('trigger/guest-newsletter')
  @HttpCode(200)
  async triggerGuestNewsletter(
    @Body() dto: TriggerDigestDto,
  ): Promise<{ ok: boolean; message: string }> {
    const date = dto.date ?? this.yesterday();

    if (!isQueueDisabled(this.config)) {
      // Redis available — enqueue for proper async processing
      const queue = new Queue(QUEUE_NAMES.DIGEST, { connection: getQueueConnection(this.config) });
      await queue.add(QUEUE_JOB_TYPES.SEND_GUEST_NEWSLETTER, { periodDate: date }, { attempts: 1 });
      await queue.close();
      return { ok: true, message: `Guest newsletter queued for ${date}` };
    }

    // Redis disabled — run directly in-process
    await this.digestProcessor.handleSendGuestNewsletter({ periodDate: date });
    return { ok: true, message: `Guest newsletter sent directly for ${date}` };
  }

  /**
   * POST /email/trigger/daily-digest
   * Manually fires the member daily digest for a given date (default: yesterday).
   * Runs directly (no queue) so it works even when REDIS_DISABLED=true.
   */
  @Public()
  @Post('trigger/daily-digest')
  @HttpCode(200)
  async triggerDailyDigest(
    @Body() dto: TriggerDigestDto,
  ): Promise<{ ok: boolean; message: string }> {
    const date = dto.date ?? this.yesterday();

    if (!isQueueDisabled(this.config)) {
      const queue = new Queue(QUEUE_NAMES.DIGEST, { connection: getQueueConnection(this.config) });
      await queue.add(QUEUE_JOB_TYPES.SEND_DAILY_DIGEST, { periodDate: date }, { attempts: 1 });
      await queue.close();
      return { ok: true, message: `Daily digest queued for ${date}` };
    }

    await this.digestProcessor.handleSendDailyDigest({ periodDate: date });
    return { ok: true, message: `Daily digest sent directly for ${date}` };
  }

  /**
   * POST /email/trigger/weekly-digest
   * Manually fires the member weekly digest for a given week start (default: last Monday).
   * Runs directly (no queue) so it works even when REDIS_DISABLED=true.
   */
  @Public()
  @Post('trigger/weekly-digest')
  @HttpCode(200)
  async triggerWeeklyDigest(
    @Body() dto: TriggerDigestDto,
  ): Promise<{ ok: boolean; message: string }> {
    const weekStart = dto.date ?? this.lastMonday();

    if (!isQueueDisabled(this.config)) {
      const queue = new Queue(QUEUE_NAMES.DIGEST, { connection: getQueueConnection(this.config) });
      await queue.add(QUEUE_JOB_TYPES.SEND_WEEKLY_DIGEST, { weekStart }, { attempts: 1 });
      await queue.close();
      return { ok: true, message: `Weekly digest queued for week starting ${weekStart}` };
    }

    await this.digestProcessor.handleSendWeeklyDigest({ weekStart });
    return { ok: true, message: `Weekly digest sent directly for week starting ${weekStart}` };
  }

  /**
   * POST /email/preview/notification
   * Reads the member from the JWT token, checks their notification preference
   * for the given type, and sends the preview email only if enabled.
   */
  @UseGuards(JwtAuthGuard)
  @Post('preview/notification')
  @HttpCode(200)
  async previewNotification(
    @CurrentUser() currentUser: AuthUser,
    @Body() dto: PreviewNotificationDto,
  ): Promise<{ ok: boolean; message: string }> {
    const sb = this.supabase.adminClient;

    // 1. Get email and name from the authenticated user's DB record
    const { data: user } = await sb
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', currentUser.dbId)
      .single() as {
        data: { id: string; email: string; first_name: string | null; last_name: string | null } | null;
      };

    if (!user) {
      return { ok: false, message: 'User record not found' };
    }

    const memberName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;

    // 2. Get their member record for the member_id
    const { data: member } = await sb
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle() as { data: { id: string } | null };

    // 3. Check the notification preference (default true if no row exists)
    let prefEnabled = true;
    if (member) {
      const { data: prefs } = await sb
        .from('member_notification_preferences')
        .select('article_status, regulatory_nudges, platform_updates')
        .eq('member_id', member.id)
        .maybeSingle() as {
          data: { article_status: boolean; regulatory_nudges: boolean; platform_updates: boolean } | null;
        };

      if (prefs) {
        prefEnabled = prefs[dto.type as keyof typeof prefs] as boolean;
      }
    }

    if (!prefEnabled) {
      return {
        ok: false,
        message: `Preference '${dto.type}' is toggled OFF for this member — email not sent`,
      };
    }

    // 4. Send the appropriate preview email
    switch (dto.type) {
      case 'article_status':
        await this.emailService.sendK9ArticleApproved({
          to: user.email,
          authorName: memberName,
          articleTitle: 'Understanding the New SEBI Regulations — 2026 Update',
          articleSlug: 'understanding-sebi-regulations-2026',
        });
        break;
      case 'regulatory_nudges':
        await this.emailService.sendK16RegulatoryNudge({
          to: user.email,
          memberName,
          updateTitle: 'RBI Circular: New Guidelines on External Commercial Borrowings',
          updateSummary: 'The Reserve Bank of India has issued updated guidelines affecting ECB norms for corporates with overseas subsidiaries.',
          source: 'Reserve Bank of India — Circular RBI/2026-27/01',
        });
        break;
      case 'platform_updates':
        await this.emailService.sendRaw({
          to: user.email,
          subject: '[Expertly] Platform Update — New Features Available',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;">
              <h2 style="color:#1e3a5f;">Platform Update</h2>
              <p style="color:#334155;font-size:15px;line-height:1.6;">Dear ${memberName},</p>
              <p style="color:#334155;font-size:15px;line-height:1.6;">
                We have launched several new features on Expertly this week, including improved article discovery,
                enhanced member profiles, and a new digest subscription system.
              </p>
              <a href="http://localhost:4000/member/dashboard" style="display:inline-block;padding:12px 24px;background:#1e3a5f;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                Go to Dashboard
              </a>
            </div>
          `,
        });
        break;
    }

    return { ok: true, message: `${dto.type} preview email sent to ${user.email}` };
  }

  private yesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0]!;
  }

  private lastMonday(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0]!;
  }
}
