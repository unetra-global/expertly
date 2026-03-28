import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmailService } from '../../common/services/email.service';
import { CacheService } from '../../common/services/cache.service';
import {
  QUEUE_NAMES,
  QUEUE_JOB_TYPES,
  getQueueConnection,
  isQueueDisabled,
} from '../../config/queue.config';

@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SchedulerService.name);
  private rssQueue!: Queue;
  private aiQueue!: Queue;
  private digestQueue!: Queue;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly email: EmailService,
    private readonly cache: CacheService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    if (isQueueDisabled(this.config)) {
      this.logger.warn('REDIS_DISABLED=true — scheduler queues not started');
      return;
    }

    const connection = getQueueConnection(this.config);
    this.rssQueue = new Queue(QUEUE_NAMES.RSS, { connection });
    this.aiQueue = new Queue(QUEUE_NAMES.AI, { connection });
    this.digestQueue = new Queue(QUEUE_NAMES.DIGEST, { connection });
    this.logger.log('Scheduler queues initialised');
  }

  async onModuleDestroy() {
    await this.rssQueue?.close();
    await this.aiQueue?.close();
    await this.digestQueue?.close();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Membership Expiry — 01:00 UTC daily
  // ─────────────────────────────────────────────────────────────────────────────
  @Cron('0 1 * * *')
  async handleMembershipExpiry(): Promise<void> {
    this.logger.log('Running membership expiry job');
    const sb = this.supabase.adminClient;

    const { data: members, error } = await sb
      .from('members')
      .select('id, slug, user_id, first_name, last_name, primary_service_id, country')
      .lte('membership_expiry_date', new Date().toISOString().split('T')[0])
      .eq('membership_status', 'active') as unknown as {
        data: Array<{
          id: string;
          slug: string;
          user_id: string;
          first_name: string | null;
          last_name: string | null;
          primary_service_id: string | null;
          country: string | null;
        }> | null;
        error: unknown;
      };

    if (error || !members || members.length === 0) {
      this.logger.log(`Membership expiry: no active expired members (error=${String(error)})`);
      return;
    }

    this.logger.log(`Expiring ${members.length} memberships`);

    for (const member of members) {
      try {
        // Update membership status + user role
        await sb
          .from('members')
          .update({ membership_status: 'expired' })
          .eq('id', member.id);

        await sb
          .from('users')
          .update({ role: 'user' })
          .eq('id', member.user_id);

        // Invalidate member caches
        await this.cache.delByPattern(`expertly:member:*${member.slug}*`);
        await this.cache.delByPattern('expertly:members:*');
        await this.cache.delByPattern('expertly:homepage:*');

        // ISR revalidate
        await this.revalidateMemberPage(member.slug);

        // Send K14 expiry email
        const { data: userData } = await sb
          .from('users')
          .select('email')
          .eq('id', member.user_id)
          .single() as unknown as { data: { email: string } | null };

        if (userData?.email) {
          await this.email.sendK14MembershipExpired({
            to: userData.email,
            memberName: [member.first_name, member.last_name].filter(Boolean).join(' ') || 'Member',
          });
        }

        this.logger.log(`Expired member ${member.slug}`);
      } catch (err) {
        this.logger.error(`Failed to expire member ${member.id}: ${(err as Error).message}`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Renewal Reminders — 02:00 UTC daily
  // ─────────────────────────────────────────────────────────────────────────────
  @Cron('0 2 * * *')
  async handleRenewalReminders(): Promise<void> {
    this.logger.log('Running renewal reminders job');
    const sb = this.supabase.adminClient;

    // Members whose membership expires exactly 30 days from today
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const { data: members } = await sb
      .from('members')
      .select('id, user_id, first_name, last_name, membership_expiry_date')
      .eq('membership_expiry_date', targetDateStr)
      .eq('membership_status', 'active') as unknown as {
        data: Array<{
          id: string;
          user_id: string;
          first_name: string | null;
          last_name: string | null;
          membership_expiry_date: string;
        }> | null;
      };

    if (!members || members.length === 0) {
      this.logger.log('Renewal reminders: no members expiring in 30 days');
      return;
    }

    this.logger.log(`Sending ${members.length} renewal reminder(s)`);

    for (const member of members) {
      try {
        const { data: userData } = await sb
          .from('users')
          .select('email')
          .eq('id', member.user_id)
          .single() as unknown as { data: { email: string } | null };

        if (!userData?.email) continue;

        await this.email.sendK13RenewalReminder({
          to: userData.email,
          memberName: [member.first_name, member.last_name].filter(Boolean).join(' ') || 'Member',
          expiryDate: member.membership_expiry_date,
          daysUntilExpiry: 30,
        });
      } catch (err) {
        this.logger.error(`Failed to send K13 to member ${member.id}: ${(err as Error).message}`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3a. Daily Digest — 07:00 UTC every day (for 'daily' frequency subscribers)
  // ─────────────────────────────────────────────────────────────────────────────
  @Cron('0 7 * * *')
  async handleDailyDigest(): Promise<void> {
    this.logger.log('Running daily digest job');

    if (!this.digestQueue) {
      this.logger.warn('Digest queue not initialised — skipping daily digest');
      return;
    }

    // Period: yesterday (articles published in the last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const periodDate = yesterday.toISOString().split('T')[0]!;

    await this.digestQueue.add(
      QUEUE_JOB_TYPES.SEND_DAILY_DIGEST,
      { periodDate },
      { attempts: 2, backoff: { type: 'exponential', delay: 5000 } },
    );

    this.logger.log(`Daily digest: queued SEND_DAILY_DIGEST for ${periodDate}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3b. Weekly Digest — 08:00 UTC every Monday (for 'weekly' subscribers)
  // ─────────────────────────────────────────────────────────────────────────────
  @Cron('0 8 * * 1')
  async handleWeeklyDigest(): Promise<void> {
    this.logger.log('Running weekly digest job');

    if (!this.digestQueue) {
      this.logger.warn('Digest queue not initialised — skipping weekly digest');
      return;
    }

    // Only run on actual Monday (guard against cron misfires in tests)
    const today = new Date();
    if (today.getDay() !== 1) {
      this.logger.log('handleWeeklyDigest called on non-Monday — skipping');
      return;
    }

    // weekStart = last Monday's date (the week that just ended)
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 7);
    lastMonday.setHours(0, 0, 0, 0);
    const weekStart = lastMonday.toISOString().split('T')[0]!;

    await this.digestQueue.add(
      QUEUE_JOB_TYPES.SEND_WEEKLY_DIGEST,
      { weekStart },
      { attempts: 2, backoff: { type: 'exponential', delay: 5000 } },
    );

    this.logger.log(`Weekly digest: queued SEND_WEEKLY_DIGEST for week starting ${weekStart}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3c. Guest Newsletter — 07:30 UTC every day (previous day's articles)
  // ─────────────────────────────────────────────────────────────────────────────
  @Cron('30 7 * * *')
  async handleGuestNewsletter(): Promise<void> {
    this.logger.log('Running guest newsletter job');

    if (!this.digestQueue) {
      this.logger.warn('Digest queue not initialised — skipping guest newsletter');
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const periodDate = yesterday.toISOString().split('T')[0]!;

    await this.digestQueue.add(
      QUEUE_JOB_TYPES.SEND_GUEST_NEWSLETTER,
      { periodDate },
      { attempts: 2, backoff: { type: 'exponential', delay: 5000 } },
    );

    this.logger.log(`Guest newsletter: queued SEND_GUEST_NEWSLETTER for ${periodDate}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. RSS Ingestion — 06:00 UTC daily
  // ─────────────────────────────────────────────────────────────────────────────
  @Cron('0 6 * * *')
  async handleRssIngestion(): Promise<void> {
    this.logger.log('Queuing RSS ingestion job');
    await this.rssQueue.add(
      QUEUE_JOB_TYPES.INGEST_ALL_FEEDS,
      {},
      { attempts: 2, backoff: { type: 'fixed', delay: 30000 } },
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Retry Failed Embeddings — 03:00 UTC daily
  // ─────────────────────────────────────────────────────────────────────────────
  @Cron('0 3 * * *')
  async retryFailedEmbeddings(): Promise<void> {
    this.logger.log('Retrying failed embeddings');
    const sb = this.supabase.adminClient;

    const { data: failedArticles } = await sb
      .from('articles')
      .select('id')
      .eq('embedding_status', 'failed')
      .limit(20) as unknown as { data: Array<{ id: string }> | null };

    const { data: failedMembers } = await sb
      .from('members')
      .select('id')
      .eq('embedding_status', 'failed')
      .limit(20) as unknown as { data: Array<{ id: string }> | null };

    let queued = 0;

    for (const article of failedArticles ?? []) {
      await this.aiQueue.add(
        QUEUE_JOB_TYPES.GENERATE_EMBEDDING,
        { entityType: 'article', entityId: article.id },
        { attempts: 3 },
      );
      queued++;
    }

    for (const member of failedMembers ?? []) {
      await this.aiQueue.add(
        QUEUE_JOB_TYPES.GENERATE_EMBEDDING,
        { entityType: 'member', entityId: member.id },
        { attempts: 3 },
      );
      queued++;
    }

    if (queued > 0) {
      this.logger.log(`Queued ${queued} failed embedding retries`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private async revalidateMemberPage(slug: string): Promise<void> {
    const nextUrl = this.config.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    const secret = this.config.get<string>('NEXT_REVALIDATE_SECRET', '');

    try {
      const res = await fetch(
        `${nextUrl}/api/revalidate?secret=${secret}&path=/members/${slug}`,
        { method: 'GET', signal: AbortSignal.timeout(5000) },
      );
      if (!res.ok) {
        this.logger.warn(`ISR revalidate for /members/${slug} returned ${res.status}`);
      }
    } catch (err) {
      this.logger.warn(`ISR revalidate for /members/${slug} failed: ${(err as Error).message}`);
    }
  }
}
