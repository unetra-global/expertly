import type { ConnectionOptions } from 'bullmq';
import { ConfigService } from '@nestjs/config';

export const QUEUE_NAMES = {
  LINKEDIN: 'linkedin-queue',
  AI: 'ai-queue',
  EMAIL: 'email-queue',
  RSS: 'rss-queue',
  DIGEST: 'digest-queue',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const QUEUE_JOB_TYPES = {
  LINKEDIN_SCRAPE: 'linkedin_scrape',
  LINKEDIN_PDF_PARSE: 'linkedin_pdf_parse',
  GENERATE_EMBEDDING: 'generate_embedding',
  SEND_EMAIL: 'send_email',
  INGEST_ALL_FEEDS: 'ingest_all_feeds',
  INGEST_SINGLE_FEED: 'ingest_single_feed',
  PROCESS_REGULATORY_UPDATE: 'process_regulatory_update',
  SEND_WEEKLY_DIGEST: 'send_weekly_digest',
  SEND_DIGEST_BATCH: 'send_digest_batch',
} as const;

export type QueueJobType = (typeof QUEUE_JOB_TYPES)[keyof typeof QUEUE_JOB_TYPES];

export function getQueueConnection(config: ConfigService): ConnectionOptions {
  const url = config.get<string>('REDIS_URL');
  const tls = config.get<string>('REDIS_TLS') === 'true';

  if (url) {
    return { url, ...(tls ? { tls: {} } : {}) } as ConnectionOptions;
  }

  return {
    host: config.get<string>('REDIS_HOST', 'localhost'),
    port: config.get<number>('REDIS_PORT', 6379),
    password: config.get<string>('REDIS_PASSWORD'),
    ...(tls ? { tls: {} } : {}),
  } as ConnectionOptions;
}
