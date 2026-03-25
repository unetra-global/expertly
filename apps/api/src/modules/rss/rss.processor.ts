import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Queue, Job } from 'bullmq';
import Parser from 'rss-parser';
import OpenAI from 'openai';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmailService } from '../../common/services/email.service';
import {
  QUEUE_NAMES,
  QUEUE_JOB_TYPES,
  getQueueConnection,
  isQueueDisabled,
} from '../../config/queue.config';

// ── RSS Feed Definitions ───────────────────────────────────────────────────

interface RssFeed {
  source: string;
  url: string;
  region: string;
  relevant_categories: string[];
}

// Google News RSS: always fresh, no 404s, real-time data.
// Official government RSS feeds were replaced because:
//   CBIC → 404, MCA → 403, RBI → malformed XML,
//   SEBI → 404, MAS → Atom format unsupported, ACRA → 404, IRS → 404,
//   SEC  → returns 2015 archive items.
// Google News search RSS gives the last 30 days of news per regulator.
const RSS_FEEDS: RssFeed[] = [
  // India
  {
    source: 'CBIC',
    url: 'https://news.google.com/rss/search?q=CBIC+GST+customs+India+notification+circular+when:30d&hl=en-IN&gl=IN&ceid=IN:en',
    region: 'IN',
    relevant_categories: ['tax', 'customs', 'gst', 'indirect-tax'],
  },
  {
    source: 'MCA',
    url: 'https://news.google.com/rss/search?q=MCA+ministry+corporate+affairs+India+regulation+when:30d&hl=en-IN&gl=IN&ceid=IN:en',
    region: 'IN',
    relevant_categories: ['corporate-law', 'company-law', 'compliance'],
  },
  {
    source: 'RBI',
    url: 'https://news.google.com/rss/search?q=RBI+Reserve+Bank+India+circular+notification+policy+when:30d&hl=en-IN&gl=IN&ceid=IN:en',
    region: 'IN',
    relevant_categories: ['banking', 'finance', 'monetary-policy', 'fintech'],
  },
  {
    source: 'SEBI',
    url: 'https://news.google.com/rss/search?q=SEBI+Securities+Exchange+Board+India+circular+when:30d&hl=en-IN&gl=IN&ceid=IN:en',
    region: 'IN',
    relevant_categories: ['securities', 'capital-markets', 'investment', 'mutual-funds'],
  },
  // Singapore
  {
    source: 'MAS',
    url: 'https://news.google.com/rss/search?q=MAS+Monetary+Authority+Singapore+regulation+when:30d&hl=en-SG&gl=SG&ceid=SG:en',
    region: 'SG',
    relevant_categories: ['banking', 'finance', 'monetary-policy', 'fintech'],
  },
  {
    source: 'ACRA',
    url: 'https://news.google.com/rss/search?q=ACRA+Singapore+corporate+compliance+when:30d&hl=en-SG&gl=SG&ceid=SG:en',
    region: 'SG',
    relevant_categories: ['corporate-law', 'company-law', 'compliance', 'accountancy'],
  },
  // USA
  {
    source: 'IRS',
    url: 'https://news.google.com/rss/search?q=IRS+tax+rule+update+regulation+when:30d&hl=en-US&gl=US&ceid=US:en',
    region: 'US',
    relevant_categories: ['tax', 'us-tax', 'international-tax'],
  },
  {
    source: 'SEC',
    url: 'https://news.google.com/rss/search?q=SEC+Securities+Exchange+Commission+enforcement+regulation+when:30d&hl=en-US&gl=US&ceid=US:en',
    region: 'US',
    relevant_categories: ['securities', 'capital-markets', 'investment', 'compliance'],
  },
];

// ── RSS Processor ──────────────────────────────────────────────────────────

@Injectable()
export class RssProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RssProcessor.name);
  private worker!: Worker;
  private queue!: Queue;
  private readonly parser: Parser;
  private readonly openai: OpenAI;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {
    this.parser = new Parser({
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Expertly-RegulatoryBot/1.0; +https://expertly.net)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async onModuleInit() {
    if (isQueueDisabled(this.config)) {
      this.logger.warn('REDIS_DISABLED=true — RSS worker not started');
      return;
    }

    const connection = getQueueConnection(this.config);

    this.queue = new Queue(QUEUE_NAMES.RSS, { connection });

    this.worker = new Worker(
      QUEUE_NAMES.RSS,
      async (job: Job) => this.process(job),
      { connection, concurrency: 3 },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`RSS job ${job?.id} failed: ${err.message}`);
    });

    this.logger.log('RSS worker started (concurrency=3)');
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
  }

  // ── Dispatch ───────────────────────────────────────────────────────────────

  private async process(job: Job): Promise<void> {
    switch (job.name) {
      case QUEUE_JOB_TYPES.INGEST_ALL_FEEDS:
        await this.handleIngestAllFeeds();
        break;
      case QUEUE_JOB_TYPES.INGEST_SINGLE_FEED:
        await this.handleIngestSingleFeed(job.data as RssFeed);
        break;
      case QUEUE_JOB_TYPES.PROCESS_REGULATORY_UPDATE:
        await this.handleProcessRegulatoryUpdate(
          job.data as { updateId: string },
        );
        break;
      default:
        this.logger.warn(`Unknown RSS job: ${job.name}`);
    }
  }

  // ── Public: direct trigger (bypasses queue — works when REDIS_DISABLED) ───

  async triggerDirectIngest(): Promise<{ inserted: number; sources: string[] }> {
    this.logger.log('Manual RSS ingest triggered from ops dashboard');
    let inserted = 0;
    const sources: string[] = [];

    for (const feed of RSS_FEEDS) {
      try {
        const count = await this.ingestFeedDirectly(feed);
        if (count > 0) {
          inserted += count;
          sources.push(`${feed.source} (+${count})`);
        }
      } catch (err) {
        this.logger.error(
          `Direct ingest failed for ${feed.source}: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(`Manual ingest complete: ${inserted} new items`);
    return { inserted, sources };
  }

  private async ingestFeedDirectly(feed: RssFeed): Promise<number> {
    const sb = this.supabase.adminClient;

    let feedData: Parser.Output<Record<string, unknown>>;
    try {
      feedData = await this.parser.parseURL(feed.url);
    } catch (err) {
      this.logger.warn(
        `Failed to parse ${feed.source}: ${(err as Error).message}`,
      );
      return 0;
    }

    const items = feedData.items ?? [];
    this.logger.log(`${feed.source}: ${items.length} items found`);
    let count = 0;

    for (const item of items) {
      const itemUrl = (item.link ?? item.guid ?? '') as string;
      if (!itemUrl) continue;

      const { data: existing } = await sb
        .from('regulatory_updates')
        .select('id')
        .eq('source_url', itemUrl)
        .maybeSingle();

      if (existing) continue;

      const content = String(
        item.contentSnippet ?? item.content ?? item.title ?? '',
      );
      let summary = content.slice(0, 280);

      try {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: `Summarise this regulatory update in exactly 2 sentences for a professional audience:\n\n${content.slice(0, 1500)}`,
            },
          ],
          max_tokens: 120,
        });
        summary = completion.choices[0]?.message?.content?.trim() ?? summary;
      } catch (aiErr) {
        this.logger.warn(
          `OpenAI summary failed for ${itemUrl}: ${(aiErr as Error).message}`,
        );
      }

      const { error } = await sb.from('regulatory_updates').insert({
        source: feed.source,
        source_url: itemUrl,
        title: String(item.title ?? ''),
        summary,
        relevant_categories: feed.relevant_categories,
        relevant_regions: [feed.region],
        published_date: item.pubDate
          ? new Date(item.pubDate as string).toISOString()
          : new Date().toISOString(),
        is_processed: false,
        nudges_sent: 0,
      });

      if (error) {
        this.logger.warn(`Insert failed for ${itemUrl}: ${error.message}`);
      } else {
        count++;
      }
    }

    return count;
  }

  // ── ingest_all_feeds ───────────────────────────────────────────────────────

  private async handleIngestAllFeeds(): Promise<void> {
    this.logger.log(`Queuing ${RSS_FEEDS.length} RSS feeds for ingestion`);
    for (const feed of RSS_FEEDS) {
      await this.queue.add(QUEUE_JOB_TYPES.INGEST_SINGLE_FEED, feed, {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
      });
    }
  }

  // ── ingest_single_feed ─────────────────────────────────────────────────────

  private async handleIngestSingleFeed(feed: RssFeed): Promise<void> {
    const sb = this.supabase.adminClient;

    let feedData: Parser.Output<Record<string, unknown>>;
    try {
      feedData = await this.parser.parseURL(feed.url);
    } catch (err) {
      this.logger.warn(
        `Failed to parse RSS feed ${feed.source}: ${(err as Error).message}`,
      );
      return;
    }

    const items = feedData.items ?? [];
    this.logger.log(`Processing ${items.length} items from ${feed.source}`);

    for (const item of items) {
      const itemUrl = (item.link ?? item.guid ?? '') as string;
      if (!itemUrl) continue;

      // Deduplication check
      const { data: existing } = await sb
        .from('regulatory_updates')
        .select('id')
        .eq('source_url', itemUrl)
        .maybeSingle();

      if (existing) continue;

      // Generate 2-sentence summary via OpenAI
      const content = String(
        item.contentSnippet ?? item.content ?? item.title ?? '',
      );
      let summary = content.slice(0, 280);

      try {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: `Summarise this regulatory update in exactly 2 sentences for a professional audience:\n\n${content.slice(0, 1500)}`,
            },
          ],
          max_tokens: 120,
        });
        summary = completion.choices[0]?.message?.content?.trim() ?? summary;
      } catch (aiErr) {
        this.logger.warn(
          `OpenAI summary failed for ${itemUrl}: ${(aiErr as Error).message}`,
        );
      }

      // Insert into regulatory_updates
      const { data: update, error } = await sb
        .from('regulatory_updates')
        .insert({
          source: feed.source,
          source_url: itemUrl,
          title: String(item.title ?? ''),
          summary,
          relevant_categories: feed.relevant_categories,
          relevant_regions: [feed.region],
          published_date: item.pubDate
            ? new Date(item.pubDate as string).toISOString()
            : new Date().toISOString(),
          is_processed: false,
          nudges_sent: 0,
        })
        .select('id')
        .single();

      if (error) {
        this.logger.warn(`Failed to insert regulatory update: ${error.message}`);
        continue;
      }

      // Queue process_regulatory_update
      await this.queue.add(
        QUEUE_JOB_TYPES.PROCESS_REGULATORY_UPDATE,
        { updateId: (update as any).id },
        { delay: 2000 },
      );
    }
  }

  // ── process_regulatory_update ──────────────────────────────────────────────

  private async handleProcessRegulatoryUpdate(data: {
    updateId: string;
  }): Promise<void> {
    const sb = this.supabase.adminClient;
    const { updateId } = data;

    // Fetch the update
    const { data: update } = await sb
      .from('regulatory_updates')
      .select('id, title, summary, source, relevant_categories')
      .eq('id', updateId)
      .single();

    if (!update) {
      this.logger.warn(`Regulatory update ${updateId} not found`);
      return;
    }

    const row = update as any;
    const relevantCategories = (row.relevant_categories as string[]) ?? [];

    // Find active members whose primary service maps to relevant categories
    // and have regulatory_nudges = true in notification preferences
    const { data: members } = await sb
      .from('members')
      .select(
        'id, first_name, last_name, user_id, ' +
          'member_services(service_id, is_primary, services(name, category_id, categories(slug))), ' +
          'member_notification_preferences(regulatory_nudges)',
      )
      .eq('status', 'active');

    if (!members || members.length === 0) return;

    let nudgesCount = 0;

    for (const member of members as any[]) {
      // Check notification preference
      const prefs = member.member_notification_preferences?.[0];
      if (!prefs?.regulatory_nudges) continue;

      // Check if primary service's category matches
      const primaryService = (member.member_services as any[])?.find(
        (ms: any) => ms.is_primary,
      );
      const categorySlug =
        primaryService?.services?.categories?.slug ?? '';
      const categoryId = primaryService?.services?.category_id ?? '';

      const matches =
        relevantCategories.some((cat) =>
          categorySlug.toLowerCase().includes(cat.toLowerCase()),
        ) || relevantCategories.includes(categoryId);

      if (!matches) continue;

      // Get user email
      const { data: userData } = await sb
        .from('users')
        .select('email')
        .eq('id', member.user_id)
        .single();

      const email = (userData as any)?.email;
      if (!email) continue;

      // Send K16 nudge email
      try {
        await this.email.sendK16RegulatoryNudge({
          to: email,
          memberName: `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim(),
          updateTitle: row.title,
          updateSummary: row.summary,
          source: row.source,
        });
        nudgesCount++;
      } catch (err) {
        this.logger.error(
          `Failed to send K16 to ${email}: ${(err as Error).message}`,
        );
      }
    }

    // Update regulatory_updates record
    await sb
      .from('regulatory_updates')
      .update({
        nudges_sent: nudgesCount,
        nudges_sent_at: new Date().toISOString(),
        is_processed: true,
      })
      .eq('id', updateId);

    this.logger.log(
      `Processed regulatory update ${updateId}: sent ${nudgesCount} nudges`,
    );
  }
}
