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
import { RedisService } from '../../common/services/redis.service';
import {
  QUEUE_NAMES,
  QUEUE_JOB_TYPES,
  getQueueConnection,
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
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
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
      .select('id, slug, user_id, first_name, last_name, primary_service_id')
      .lte('membership_expiry_date', new Date().toISOString().split('T')[0])
      .eq('status', 'active') as unknown as {
        data: Array<{
          id: string;
          slug: string;
          user_id: string;
          first_name: string | null;
          last_name: string | null;
          primary_service_id: string | null;
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
          .update({ status: 'expired' })
          .eq('id', member.id);

        await sb
          .from('users')
          .update({ role: 'user' })
          .eq('id', member.user_id);

        // Release seat via RPC
        if (member.primary_service_id) {
          await sb.rpc('release_seat', { p_service_id: member.primary_service_id });
        }

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
      .eq('status', 'active') as unknown as {
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
  // 3. Weekly Digest — 08:00 UTC every Monday
  // ─────────────────────────────────────────────────────────────────────────────
  @Cron('0 8 * * 1')
  async handleWeeklyDigest(): Promise<void> {
    this.logger.log('Running weekly digest job');
    const sb = this.supabase.adminClient;

    // Calculate last Monday as week_start
    const today = new Date();
    const day = today.getDay(); // 0=Sun, 1=Mon, …
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) - 7);
    lastMonday.setHours(0, 0, 0, 0);
    const weekStart = lastMonday.toISOString().split('T')[0];

    // Idempotency check — skip if already queued this week
    const lockKey = `expertly:digest:lock:${weekStart}`;
    const alreadySent = await this.redis.client.get(lockKey);
    if (alreadySent) {
      this.logger.log(`Weekly digest for ${weekStart} already dispatched — skipping`);
      return;
    }

    // Mark as dispatched before queuing (7-day TTL)
    await this.redis.client.set(lockKey, '1', 'EX', 7 * 86400);

    // Get digest data
    const { data: digestRows } = await sb.rpc('get_digest_data', {
      p_week_start: weekStart,
    }) as unknown as { data: Array<{ user_id: string; articles: unknown[] }> | null };

    if (!digestRows || digestRows.length === 0) {
      this.logger.log(`No digest data for week starting ${weekStart}`);
      return;
    }

    // Queue individual digest jobs for subscribers with articles
    let queued = 0;
    for (const row of digestRows) {
      if (!row.articles || (row.articles as unknown[]).length === 0) continue;
      await this.digestQueue.add(
        QUEUE_JOB_TYPES.SEND_WEEKLY_DIGEST,
        { weekStart, userId: row.user_id },
        { attempts: 2, backoff: { type: 'exponential', delay: 5000 } },
      );
      queued++;
    }

    this.logger.log(`Weekly digest: queued ${queued} digest jobs for ${weekStart}`);
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
  // 5. Flush View Counts — every 15 minutes
  // ─────────────────────────────────────────────────────────────────────────────
  @Cron('*/15 * * * *')
  async flushViewCounts(): Promise<void> {
    const client = this.redis.client;
    const sb = this.supabase.adminClient;

    // Find all view count keys
    const memberKeys = await client.keys('expertly:member:views:*');
    const articleKeys = await client.keys('expertly:article:views:*');

    let flushed = 0;

    // Flush member view counts
    for (const key of memberKeys) {
      try {
        const val = await client.get(key);
        if (!val) continue;
        const count = parseInt(val, 10);
        if (isNaN(count) || count <= 0) {
          await client.del(key);
          continue;
        }

        // Key format: expertly:member:views:{memberId}
        const memberId = key.split(':').pop();
        if (!memberId) continue;

        await sb.rpc('increment_member_view_count', {
          p_member_id: memberId,
          p_count: count,
        });

        await client.del(key);
        flushed++;
      } catch (err) {
        this.logger.warn(`Failed to flush member view key ${key}: ${(err as Error).message}`);
      }
    }

    // Flush article view counts
    for (const key of articleKeys) {
      try {
        const val = await client.get(key);
        if (!val) continue;
        const count = parseInt(val, 10);
        if (isNaN(count) || count <= 0) {
          await client.del(key);
          continue;
        }

        // Key format: expertly:article:views:{articleId}
        const articleId = key.split(':').pop();
        if (!articleId) continue;

        await sb
          .from('articles')
          .update({ view_count: sb.rpc('increment', { x: count }) as unknown as number })
          .eq('id', articleId);

        await client.del(key);
        flushed++;
      } catch (err) {
        this.logger.warn(`Failed to flush article view key ${key}: ${(err as Error).message}`);
      }
    }

    if (flushed > 0) {
      this.logger.log(`Flushed ${flushed} view count(s) to DB`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Retry Failed Embeddings — 03:00 UTC daily
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
