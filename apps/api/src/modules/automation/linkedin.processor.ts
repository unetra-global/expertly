import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import axios from 'axios';
import { SupabaseService } from '../../common/services/supabase.service';
import {
  QUEUE_NAMES,
  QUEUE_JOB_TYPES,
  getQueueConnection,
} from '../../config/queue.config';

@Injectable()
export class LinkedInProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LinkedInProcessor.name);
  private worker!: Worker;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async onModuleInit() {
    this.worker = new Worker(
      QUEUE_NAMES.LINKEDIN,
      async (job: Job) => this.process(job),
      { connection: getQueueConnection(this.config), concurrency: 2 },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });

    this.logger.log('LinkedIn worker started (concurrency=2)');
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  // ── Dispatch ───────────────────────────────────────────────────────────────

  private async process(job: Job): Promise<void> {
    switch (job.name) {
      case QUEUE_JOB_TYPES.LINKEDIN_SCRAPE:
        await this.handleLinkedInScrape(job);
        break;
      case QUEUE_JOB_TYPES.LINKEDIN_PDF_PARSE:
        await this.handleLinkedInPdfParse(job);
        break;
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }

  // ── linkedin_scrape ────────────────────────────────────────────────────────

  private async handleLinkedInScrape(job: Job): Promise<void> {
    const { jobId, linkedinUrl } = job.data as {
      jobId: string;
      linkedinUrl: string;
    };
    const sb = this.supabase.adminClient;
    const apiKey = this.config.get<string>('APIFY_API_KEY', '');

    try {
      if (!apiKey) throw new Error('APIFY_API_KEY not configured');
      if (!linkedinUrl) throw new Error('linkedinUrl is required');

      // Start Apify actor run
      const startResp = await axios.post(
        `https://api.apify.com/v2/acts/anchor~linkedin-profile-scraper/runs`,
        { startUrls: [{ url: linkedinUrl }] },
        { params: { token: apiKey } },
      );

      const runId: string = startResp.data?.data?.id;
      if (!runId) throw new Error('Failed to start Apify run');

      // Poll (max 90s, every 5s = 18 attempts)
      let result: unknown = null;
      for (let i = 0; i < 18; i++) {
        await new Promise((r) => setTimeout(r, 5000));

        const statusResp = await axios.get(
          `https://api.apify.com/v2/acts/anchor~linkedin-profile-scraper/runs/${runId}`,
          { params: { token: apiKey } },
        );

        const status: string = statusResp.data?.data?.status;

        if (status === 'SUCCEEDED') {
          const itemsResp = await axios.get(
            `https://api.apify.com/v2/acts/anchor~linkedin-profile-scraper/runs/${runId}/dataset/items`,
            { params: { token: apiKey } },
          );
          result = itemsResp.data?.[0] ?? null;
          break;
        } else if (status === 'FAILED' || status === 'ABORTED') {
          throw new Error(`Apify run ${status.toLowerCase()}`);
        }
      }

      if (!result) throw new Error('Apify run timed out (90s)');

      await sb
        .from('background_jobs')
        .update({
          status: 'completed',
          result,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      this.logger.log(`LinkedIn scrape completed for job ${jobId}`);
    } catch (err) {
      const message = (err as Error).message;
      this.logger.error(`LinkedIn scrape failed for job ${jobId}: ${message}`);
      await sb
        .from('background_jobs')
        .update({
          status: 'failed',
          error: message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
      throw err;
    }
  }

  // ── linkedin_pdf_parse ─────────────────────────────────────────────────────

  private async handleLinkedInPdfParse(job: Job): Promise<void> {
    const { jobId, pdfUrl } = job.data as { jobId: string; pdfUrl: string };
    const sb = this.supabase.adminClient;

    try {
      // PDF parsing placeholder — integrate Anthropic/OpenAI Vision if needed
      await sb
        .from('background_jobs')
        .update({
          status: 'completed',
          result: { pdfUrl, parsed: true },
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    } catch (err) {
      const message = (err as Error).message;
      await sb
        .from('background_jobs')
        .update({
          status: 'failed',
          error: message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
      throw err;
    }
  }
}
