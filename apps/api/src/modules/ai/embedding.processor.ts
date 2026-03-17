import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmbeddingService } from '../../common/services/embedding.service';
import {
  QUEUE_NAMES,
  QUEUE_JOB_TYPES,
  getQueueConnection,
  isQueueDisabled,
} from '../../config/queue.config';

type EmbeddingJobData = {
  entityType: 'member' | 'article' | 'event';
  entityId: string;
};

@Injectable()
export class EmbeddingProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmbeddingProcessor.name);
  private worker!: Worker;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async onModuleInit() {
    if (isQueueDisabled(this.config)) {
      this.logger.warn('REDIS_DISABLED=true — embedding worker not started');
      return;
    }

    this.worker = new Worker(
      QUEUE_NAMES.AI,
      async (job: Job) => this.process(job),
      { connection: getQueueConnection(this.config), concurrency: 5 },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Embedding job ${job?.id} failed: ${err.message}`);
    });

    this.logger.log('Embedding worker started (concurrency=5)');
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  // ── Dispatch ───────────────────────────────────────────────────────────────

  private async process(job: Job): Promise<void> {
    if (job.name === QUEUE_JOB_TYPES.GENERATE_EMBEDDING) {
      await this.generateEmbedding(job.data as EmbeddingJobData);
    }
  }

  // ── Generate embedding ─────────────────────────────────────────────────────

  private async generateEmbedding({
    entityType,
    entityId,
  }: EmbeddingJobData): Promise<void> {
    const sb = this.supabase.adminClient;
    const table =
      entityType === 'member'
        ? 'members'
        : entityType === 'article'
          ? 'articles'
          : 'events';

    try {
      let text = '';

      if (entityType === 'member') {
        const { data: m } = await sb
          .from('members')
          .select(
            'first_name, last_name, designation, headline, bio, country, city, qualifications',
          )
          .eq('id', entityId)
          .single();

        const { data: svc } = await sb
          .from('member_services')
          .select('services(name)')
          .eq('member_id', entityId)
          .eq('is_primary', true)
          .maybeSingle();

        const row = m as any;
        const serviceName = (svc as any)?.services?.name ?? '';
        const quals =
          ((row?.qualifications as string[] | null) ?? []).join(' ');

        text = [
          row?.first_name,
          row?.last_name,
          row?.designation,
          row?.headline,
          row?.bio,
          serviceName,
          row?.country,
          row?.city,
          quals,
        ]
          .filter(Boolean)
          .join(' ');
      } else if (entityType === 'article') {
        const { data: a } = await sb
          .from('articles')
          .select('title, subtitle, excerpt, tags')
          .eq('id', entityId)
          .single();

        const row = a as any;
        const tags = ((row?.tags as string[] | null) ?? []).join(' ');
        text = [row?.title, row?.subtitle, row?.excerpt, tags]
          .filter(Boolean)
          .join(' ');
      } else if (entityType === 'event') {
        const { data: e } = await sb
          .from('events')
          .select('title, description, event_type, country, city')
          .eq('id', entityId)
          .single();

        const row = e as any;
        text = [row?.title, row?.description, row?.event_type, row?.country, row?.city]
          .filter(Boolean)
          .join(' ');
      }

      if (!text.trim()) {
        this.logger.warn(
          `No text content to embed for ${entityType} ${entityId}`,
        );
        return;
      }

      const vector = await this.embeddingService.embed(text);
      if (!vector) throw new Error('Embedding service returned no vector');

      await sb
        .from(table)
        .update({
          embedding: JSON.stringify(vector),
          embedding_status: 'generated',
          embedding_generated_at: new Date().toISOString(),
        })
        .eq('id', entityId);

      this.logger.log(`Embedding generated: ${entityType} ${entityId}`);
    } catch (err) {
      const message = (err as Error).message;
      this.logger.error(
        `Embedding failed for ${entityType} ${entityId}: ${message}`,
      );

      await sb
        .from(table)
        .update({
          embedding_status: 'failed',
          embedding_error: message,
        })
        .eq('id', entityId);

      throw err;
    }
  }
}
