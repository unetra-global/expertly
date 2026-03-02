import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import { EmailService } from '../../common/services/email.service';
import {
  QUEUE_NAMES,
  QUEUE_JOB_TYPES,
  getQueueConnection,
} from '../../config/queue.config';

@Injectable()
export class EmailProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailProcessor.name);
  private worker!: Worker;

  constructor(
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    this.worker = new Worker(
      QUEUE_NAMES.EMAIL,
      async (job: Job) => this.process(job),
      { connection: getQueueConnection(this.config), concurrency: 10 },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Email job ${job?.id} failed: ${err.message}`);
    });

    this.logger.log('Email worker started (concurrency=10)');
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  private async process(job: Job): Promise<void> {
    if (job.name === QUEUE_JOB_TYPES.SEND_EMAIL) {
      const { template, to, variables } = job.data as {
        template: string;
        to: string;
        variables: Record<string, unknown>;
      };
      await this.emailService.sendEmail(template, to, variables);
    }
  }
}
