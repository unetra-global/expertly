import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Queue, Job } from 'bullmq';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmailService } from '../../common/services/email.service';
import {
  QUEUE_NAMES,
  QUEUE_JOB_TYPES,
  getQueueConnection,
  isQueueDisabled,
} from '../../config/queue.config';

const DIGEST_BATCH_SIZE = 50;

interface DigestRow {
  user_id: string;
  email: string;
  member_name: string;
  category_name: string;
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    author_name: string | null;
  }>;
}

interface DigestBatchRecipient {
  userId: string;
  email: string;
  memberName: string;
  categoryName: string;
  articles: DigestRow['articles'];
}

@Injectable()
export class DigestProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DigestProcessor.name);
  private worker!: Worker;
  private queue!: Queue;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  async onModuleInit() {
    if (isQueueDisabled(this.config)) return;

    const connection = getQueueConnection(this.config);

    this.queue = new Queue(QUEUE_NAMES.DIGEST, { connection });

    // concurrency=1: digest batches run sequentially to avoid email rate-limit spikes
    this.worker = new Worker(
      QUEUE_NAMES.DIGEST,
      async (job: Job) => this.process(job),
      { connection, concurrency: 1 },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Digest job ${job?.id} (${job?.name}) failed: ${err.message}`);
    });

    this.logger.log('Digest worker started (concurrency=1)');
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
  }

  // ── Dispatch ─────────────────────────────────────────────────────────────────

  private async process(job: Job): Promise<void> {
    switch (job.name) {
      case QUEUE_JOB_TYPES.SEND_WEEKLY_DIGEST:
        await this.handleSendWeeklyDigest(job.data as { weekStart: string });
        break;
      case QUEUE_JOB_TYPES.SEND_DIGEST_BATCH:
        await this.handleSendDigestBatch(
          job.data as { recipients: DigestBatchRecipient[]; weekStart: string },
        );
        break;
      default:
        this.logger.warn(`Unknown digest job: ${job.name}`);
    }
  }

  // ── send_weekly_digest ────────────────────────────────────────────────────────
  // Fetches all subscriber+article rows for the week and splits into batches.

  private async handleSendWeeklyDigest(data: { weekStart: string }): Promise<void> {
    const { weekStart } = data;
    const sb = this.supabase.adminClient;

    this.logger.log(`Fetching digest data for week starting ${weekStart}`);

    const { data: rows, error } = await sb.rpc('get_digest_data', {
      p_week_start: weekStart,
    }) as unknown as { data: DigestRow[] | null; error: unknown };

    if (error || !rows) {
      this.logger.error(`get_digest_data failed for ${weekStart}: ${String(error)}`);
      return;
    }

    // Only include rows that have articles
    const eligible = rows.filter((r) => r.articles && r.articles.length > 0);

    if (eligible.length === 0) {
      this.logger.log(`No eligible subscribers for digest week ${weekStart}`);
      return;
    }

    // Split into batches of DIGEST_BATCH_SIZE
    const batches: DigestBatchRecipient[][] = [];
    for (let i = 0; i < eligible.length; i += DIGEST_BATCH_SIZE) {
      batches.push(
        eligible.slice(i, i + DIGEST_BATCH_SIZE).map((r) => ({
          userId: r.user_id,
          email: r.email,
          memberName: r.member_name,
          categoryName: r.category_name ?? 'Finance & Tax',
          articles: r.articles,
        })),
      );
    }

    this.logger.log(
      `Queuing ${batches.length} batch(es) for ${eligible.length} subscribers (${weekStart})`,
    );

    for (const batch of batches) {
      await this.queue.add(
        QUEUE_JOB_TYPES.SEND_DIGEST_BATCH,
        { recipients: batch, weekStart },
        { attempts: 2, backoff: { type: 'exponential', delay: 10000 } },
      );
    }
  }

  // ── send_digest_batch ─────────────────────────────────────────────────────────
  // Sends K15 digest emails to a batch of recipients with per-user idempotency.

  private async handleSendDigestBatch(data: {
    recipients: DigestBatchRecipient[];
    weekStart: string;
  }): Promise<void> {
    const { recipients, weekStart } = data;
    const sb = this.supabase.adminClient;

    let sent = 0;
    let skipped = 0;

    for (const recipient of recipients) {
      try {
        // Idempotency check — skip if this user already received this week's digest
        const { data: existing } = await sb
          .from('digest_send_log')
          .select('id')
          .eq('user_id', recipient.userId)
          .eq('week_start', weekStart)
          .maybeSingle() as unknown as { data: { id: string } | null };

        if (existing) {
          skipped++;
          continue;
        }

        // Send K15 weekly digest email
        await this.email.sendK15WeeklyDigest({
          to: recipient.email,
          memberName: recipient.memberName,
          categoryName: recipient.categoryName,
          articles: recipient.articles.map((a) => ({
            title: a.title,
            slug: a.slug,
            authorName: a.author_name ?? '',
          })),
        });

        // Record in digest_send_log for idempotency
        await sb.from('digest_send_log').insert({
          user_id: recipient.userId,
          week_start: weekStart,
          sent_at: new Date().toISOString(),
          article_count: recipient.articles.length,
        });

        sent++;
      } catch (err) {
        this.logger.error(
          `Failed to send digest to ${recipient.email}: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(
      `Digest batch (${weekStart}): sent=${sent}, skipped=${skipped}/${recipients.length}`,
    );
  }
}
