import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SupabaseService } from '../../common/services/supabase.service';
import { RedisService } from '../../common/services/redis.service';
import {
  QUEUE_NAMES,
  QUEUE_JOB_TYPES,
  getQueueConnection,
} from '../../config/queue.config';
import type { AuthUser } from '@expertly/types';

const LINKEDIN_RATE_LIMIT_TTL = 3600; // 1 hour in seconds

@Controller('automation')
@UseGuards(JwtAuthGuard)
export class AutomationController {
  private readonly linkedInQueue: Queue;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.linkedInQueue = new Queue(QUEUE_NAMES.LINKEDIN, {
      connection: getQueueConnection(config),
    });
  }

  /** Check and set rate limit — throws 429 if already used within TTL */
  private async checkLinkedInRateLimit(userId: string): Promise<void> {
    const key = `expertly:linkedin:ratelimit:${userId}`;
    const existing = await this.redis.get(key);
    if (existing) {
      throw new HttpException(
        'Rate limit exceeded: LinkedIn import is limited to once per hour',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await this.redis.set(key, '1', 'EX', LINKEDIN_RATE_LIMIT_TTL);
  }

  // ── POST /automation/linkedin-scrape ───────────────────────────────────────

  @Post('linkedin-scrape')
  async linkedInScrape(@CurrentUser() user: AuthUser) {
    await this.checkLinkedInRateLimit(user.dbId);

    const sb = this.supabase.adminClient;

    // Get member's LinkedIn URL
    const { data: member } = await sb
      .from('members')
      .select('linkedin_url')
      .eq('user_id', user.dbId)
      .single();

    const linkedinUrl = (member as any)?.linkedin_url ?? '';

    // Create background_jobs record
    const { data: job, error } = await sb
      .from('background_jobs')
      .insert({
        user_id: user.dbId,
        queue: QUEUE_NAMES.LINKEDIN,
        job_type: QUEUE_JOB_TYPES.LINKEDIN_SCRAPE,
        status: 'queued',
        payload: { linkedinUrl },
      })
      .select('id')
      .single();

    if (error || !job) {
      throw new Error('Failed to create background job');
    }

    const jobId = (job as any).id as string;

    // Add BullMQ job with jobId = background_jobs.id
    await this.linkedInQueue.add(
      QUEUE_JOB_TYPES.LINKEDIN_SCRAPE,
      { jobId, linkedinUrl, userId: user.dbId },
      { jobId },
    );

    return { jobId };
  }

  // ── POST /automation/parse-linkedin-pdf ────────────────────────────────────

  @Post('parse-linkedin-pdf')
  async parseLinkedInPdf(
    @CurrentUser() user: AuthUser,
    @Body() body: { pdfUrl: string },
  ) {
    await this.checkLinkedInRateLimit(user.dbId);

    const sb = this.supabase.adminClient;

    const { data: job, error } = await sb
      .from('background_jobs')
      .insert({
        user_id: user.dbId,
        queue: QUEUE_NAMES.LINKEDIN,
        job_type: QUEUE_JOB_TYPES.LINKEDIN_PDF_PARSE,
        status: 'queued',
        payload: { pdfUrl: body.pdfUrl },
      })
      .select('id')
      .single();

    if (error || !job) {
      throw new Error('Failed to create background job');
    }

    const jobId = (job as any).id as string;

    await this.linkedInQueue.add(
      QUEUE_JOB_TYPES.LINKEDIN_PDF_PARSE,
      { jobId, pdfUrl: body.pdfUrl, userId: user.dbId },
      { jobId },
    );

    return { jobId };
  }

  // ── GET /automation/job/:jobId/status ──────────────────────────────────────

  @Get('job/:jobId/status')
  async getJobStatus(
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const sb = this.supabase.adminClient;

    const { data, error } = await sb
      .from('background_jobs')
      .select('id, user_id, status, error, created_at, updated_at')
      .eq('id', jobId)
      .single();

    if (error || !data) throw new NotFoundException('Job not found');

    const row = data as any;
    if (row.user_id !== user.dbId) throw new ForbiddenException('Access denied');

    return { status: row.status, error: row.error };
  }

  // ── GET /automation/job/:jobId/result ──────────────────────────────────────

  @Get('job/:jobId/result')
  async getJobResult(
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const sb = this.supabase.adminClient;

    const { data, error } = await sb
      .from('background_jobs')
      .select('id, user_id, status, result, error')
      .eq('id', jobId)
      .single();

    if (error || !data) throw new NotFoundException('Job not found');

    const row = data as any;
    if (row.user_id !== user.dbId) throw new ForbiddenException('Access denied');

    return row;
  }
}
