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

// ── Shared types ──────────────────────────────────────────────────────────────

interface ArticleRef {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author_name: string | null;
}

// ── Weekly / Daily subscriber row (from get_digest_data RPC) ──────────────────

interface DigestRow {
  user_id: string;
  email: string;
  member_name: string;
  category_id: string;
  category_name: string;
  frequency: string;
  articles: ArticleRef[];
}

// ── Guest newsletter subscriber row ──────────────────────────────────────────

interface GuestNewsletterRow {
  id: string;
  name: string;
  email: string;
  category_id: string | null;
  category_name: string | null;
}

interface DigestBatchRecipient {
  userId: string;
  email: string;
  memberName: string;
  categoryId: string;
  categoryName: string;
  articles: ArticleRef[];
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
      case QUEUE_JOB_TYPES.SEND_DAILY_DIGEST:
        await this.handleSendDailyDigest(job.data as { periodDate: string });
        break;
      case QUEUE_JOB_TYPES.SEND_GUEST_NEWSLETTER:
        await this.handleSendGuestNewsletter(job.data as { periodDate: string });
        break;
      case QUEUE_JOB_TYPES.SEND_DIGEST_BATCH:
        await this.handleSendDigestBatch(
          job.data as { recipients: DigestBatchRecipient[]; periodDate: string },
        );
        break;
      default:
        this.logger.warn(`Unknown digest job: ${job.name}`);
    }
  }

  // ── send_weekly_digest ────────────────────────────────────────────────────────
  // Fetches all 'weekly' (and 'fortnightly' when applicable) subscribers
  // and splits them into batches.

  async handleSendWeeklyDigest(data: { weekStart: string }): Promise<void> {
    const { weekStart } = data;
    const sb = this.supabase.adminClient;

    this.logger.log(`Fetching weekly digest data for week starting ${weekStart}`);

    const { data: rows, error } = await sb.rpc('get_digest_data', {
      p_week_start: weekStart,
    }) as unknown as { data: DigestRow[] | null; error: unknown };

    if (error || !rows) {
      this.logger.error(`get_digest_data failed for ${weekStart}: ${String(error)}`);
      return;
    }

    // Only weekly/fortnightly subscribers — daily handled separately
    const eligible = rows.filter(
      (r) => r.articles && r.articles.length > 0 && r.frequency !== 'daily',
    );

    if (eligible.length === 0) {
      this.logger.log(`No eligible weekly/fortnightly subscribers for ${weekStart}`);
      return;
    }

    const recipients: DigestBatchRecipient[] = eligible.map((r) => ({
      userId: r.user_id,
      email: r.email,
      memberName: r.member_name,
      categoryId: r.category_id,
      categoryName: r.category_name,
      articles: r.articles,
    }));

    await this.enqueueBatches(recipients, weekStart);
    this.logger.log(`Weekly digest: queued ${recipients.length} recipients for ${weekStart}`);
  }

  // ── send_daily_digest ─────────────────────────────────────────────────────────
  // Fetches subscribers with frequency='daily' and articles published yesterday.

  async handleSendDailyDigest(data: { periodDate: string }): Promise<void> {
    const { periodDate } = data;
    const sb = this.supabase.adminClient;

    this.logger.log(`Fetching daily digest data for ${periodDate}`);

    // Query daily subscribers with articles published on periodDate
    const { data: rows, error } = await sb
      .from('user_digest_subscriptions')
      .select(`
        user_id,
        category_id,
        frequency,
        users!user_id(id, email, first_name, last_name),
        categories!category_id(id, name)
      `)
      .eq('is_active', true)
      .eq('frequency', 'daily') as unknown as {
        data: Array<{
          user_id: string;
          category_id: string;
          frequency: string;
          users: { id: string; email: string; first_name: string; last_name: string } | null;
          categories: { id: string; name: string } | null;
        }> | null;
        error: unknown;
      };

    if (error || !rows || rows.length === 0) {
      this.logger.log(`No daily subscribers (error=${String(error)})`);
      return;
    }

    // For each subscriber, fetch articles published on the periodDate
    const recipients: DigestBatchRecipient[] = [];

    for (const row of rows) {
      if (!row.users || !row.categories) continue;

      const { data: articles } = await sb
        .from('articles')
        .select('id, title, slug, excerpt, members!author_id(users!user_id(first_name, last_name))')
        .eq('category_id', row.category_id)
        .eq('status', 'published')
        .gte('published_at', `${periodDate}T00:00:00Z`)
        .lte('published_at', `${periodDate}T23:59:59Z`) as unknown as {
          data: Array<{
            id: string;
            title: string;
            slug: string;
            excerpt: string | null;
            members: { users: { first_name: string; last_name: string } } | null;
          }> | null;
        };

      if (!articles || articles.length === 0) continue;

      // Idempotency: skip if already sent today
      const { data: alreadySent } = await sb
        .from('digest_send_log')
        .select('id')
        .eq('user_id', row.user_id)
        .eq('category_id', row.category_id)
        .eq('period_date', periodDate)
        .maybeSingle() as { data: { id: string } | null };

      if (alreadySent) continue;

      recipients.push({
        userId: row.user_id,
        email: row.users.email,
        memberName: [row.users.first_name, row.users.last_name].filter(Boolean).join(' ') || 'Subscriber',
        categoryId: row.category_id,
        categoryName: row.categories.name,
        articles: articles.map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          author_name: a.members?.users
            ? `${a.members.users.first_name} ${a.members.users.last_name}`.trim()
            : null,
        })),
      });
    }

    if (recipients.length === 0) {
      this.logger.log(`Daily digest ${periodDate}: no eligible recipients`);
      return;
    }

    await this.enqueueBatches(recipients, periodDate);
    this.logger.log(`Daily digest ${periodDate}: queued ${recipients.length} recipients`);
  }

  // ── send_guest_newsletter ─────────────────────────────────────────────────────
  // Sends previous day's articles to guest newsletter subscribers by category.

  async handleSendGuestNewsletter(data: { periodDate: string }): Promise<void> {
    const { periodDate } = data;
    const sb = this.supabase.adminClient;

    this.logger.log(`Sending guest newsletter for ${periodDate}`);

    const { data: subscribers, error } = await sb
      .from('guest_newsletter_subscriptions')
      .select('id, name, email, category_id, categories!category_id(name)')
      .eq('is_active', true) as unknown as {
        data: Array<{
          id: string;
          name: string;
          email: string;
          category_id: string | null;
          categories: { name: string } | null;
        }> | null;
        error: unknown;
      };

    if (error || !subscribers || subscribers.length === 0) {
      this.logger.log(`No active guest newsletter subscribers (error=${String(error)})`);
      return;
    }

    let sent = 0;
    let skipped = 0;

    for (const sub of subscribers) {
      try {
        // Idempotency: skip if already sent today for this subscriber+category
        const { data: alreadySent } = await sb
          .from('digest_send_log')
          .select('id')
          .eq('guest_email', sub.email)
          .eq('period_date', periodDate)
          .maybeSingle() as { data: { id: string } | null };

        if (alreadySent) {
          skipped++;
          continue;
        }

        // Fetch articles for their subscribed category (or all if no category)
        let articlesQuery = sb
          .from('articles')
          .select('id, title, slug, members!author_id(users!user_id(first_name, last_name))')
          .eq('status', 'published')
          .gte('published_at', `${periodDate}T00:00:00Z`)
          .lte('published_at', `${periodDate}T23:59:59Z`);

        if (sub.category_id) {
          articlesQuery = articlesQuery.eq('category_id', sub.category_id) as typeof articlesQuery;
        }

        const { data: articles } = await articlesQuery as unknown as {
          data: Array<{
            id: string;
            title: string;
            slug: string;
            members: { users: { first_name: string; last_name: string } } | null;
          }> | null;
        };

        if (!articles || articles.length === 0) {
          skipped++;
          continue;
        }

        const categoryName = sub.categories?.name ?? 'Finance & Legal';

        await this.email.sendK15WeeklyDigest({
          to: sub.email,
          memberName: sub.name,
          categoryName,
          articles: articles.map((a) => ({
            title: a.title,
            slug: a.slug,
            authorName: a.members?.users
              ? `${a.members.users.first_name} ${a.members.users.last_name}`.trim()
              : '',
          })),
        });

        // Record send for idempotency
        await sb.from('digest_send_log').insert({
          guest_email: sub.email,
          category_id: sub.category_id,
          period_date: periodDate,
          sent_at: new Date().toISOString(),
        });

        sent++;
      } catch (err) {
        this.logger.error(
          `Guest newsletter failed for ${sub.email}: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(
      `Guest newsletter ${periodDate}: sent=${sent}, skipped=${skipped}/${subscribers.length}`,
    );
  }

  // ── send_digest_batch ─────────────────────────────────────────────────────────
  // Sends K15 digest emails to a batch of recipients with per-user idempotency.

  async handleSendDigestBatch(data: {
    recipients: DigestBatchRecipient[];
    periodDate: string;
  }): Promise<void> {
    const { recipients, periodDate } = data;
    const sb = this.supabase.adminClient;

    let sent = 0;
    let skipped = 0;

    for (const recipient of recipients) {
      try {
        // Idempotency: skip if already sent for this user+category+period
        const { data: existing } = await sb
          .from('digest_send_log')
          .select('id')
          .eq('user_id', recipient.userId)
          .eq('category_id', recipient.categoryId)
          .eq('period_date', periodDate)
          .maybeSingle() as { data: { id: string } | null };

        if (existing) {
          skipped++;
          continue;
        }

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

        // Record in digest_send_log
        await sb.from('digest_send_log').insert({
          user_id: recipient.userId,
          category_id: recipient.categoryId,
          period_date: periodDate,
          week_start: periodDate, // backward compat with existing column
          sent_at: new Date().toISOString(),
        });

        sent++;
      } catch (err) {
        this.logger.error(
          `Failed to send digest to ${recipient.email}: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(
      `Digest batch (${periodDate}): sent=${sent}, skipped=${skipped}/${recipients.length}`,
    );
  }

  // ── Helper — enqueue recipients in batches ────────────────────────────────────

  private async enqueueBatches(
    recipients: DigestBatchRecipient[],
    periodDate: string,
  ): Promise<void> {
    for (let i = 0; i < recipients.length; i += DIGEST_BATCH_SIZE) {
      const batch = recipients.slice(i, i + DIGEST_BATCH_SIZE);

      if (this.queue) {
        // Redis available — enqueue for async processing
        await this.queue.add(
          QUEUE_JOB_TYPES.SEND_DIGEST_BATCH,
          { recipients: batch, periodDate },
          { attempts: 2, backoff: { type: 'exponential', delay: 10_000 } },
        );
      } else {
        // Redis disabled — process batch directly in-process
        await this.handleSendDigestBatch({ recipients: batch, periodDate });
      }
    }
  }
}
