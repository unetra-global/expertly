import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY not set — email sending is disabled');
    }
  }

  private get opsEmail(): string {
    return this.config.get<string>('OPS_EMAIL', 'ops@expertly.global');
  }

  private get fromEmail(): string {
    return this.config.get<string>('FROM_EMAIL', 'noreply@expertly.global');
  }

  /**
   * K1 — New application submitted (to ops team)
   */
  async sendK1ApplicationSubmitted(opts: {
    applicantName: string;
    applicantEmail: string;
    applicationId: string;
  }): Promise<void> {
    if (!this.resend) return;
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: this.opsEmail,
        subject: `[Expertly] New Application Submitted — ${opts.applicantName}`,
        html: `
          <h2>New Member Application</h2>
          <p><strong>Applicant:</strong> ${opts.applicantName}</p>
          <p><strong>Email:</strong> ${opts.applicantEmail}</p>
          <p><strong>Application ID:</strong> ${opts.applicationId}</p>
          <p>Please review in the admin dashboard.</p>
        `,
      });
    } catch (err) {
      this.logger.error('Failed to send K1 email', err);
    }
  }

  /**
   * K6 — Consultation request received (to member)
   */
  async sendK6ConsultationReceived(opts: {
    memberEmail: string;
    memberName: string;
    requesterEmail: string;
    requesterName: string;
    subject: string;
  }): Promise<void> {
    if (!this.resend) return;
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: opts.memberEmail,
        subject: `[Expertly] New Consultation Request — ${opts.subject}`,
        html: `
          <h2>You have a new consultation request</h2>
          <p><strong>From:</strong> ${opts.requesterName} (${opts.requesterEmail})</p>
          <p><strong>Subject:</strong> ${opts.subject}</p>
          <p>Log in to Expertly to respond.</p>
        `,
      });
    } catch (err) {
      this.logger.error('Failed to send K6 email', err);
    }
  }

  /**
   * K7 — Consultation request confirmation (to requester)
   */
  async sendK7ConsultationConfirmation(opts: {
    requesterEmail: string;
    requesterName: string;
    memberName: string;
    subject: string;
  }): Promise<void> {
    if (!this.resend) return;
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: opts.requesterEmail,
        subject: `[Expertly] Consultation Request Sent — ${opts.subject}`,
        html: `
          <h2>Your consultation request has been sent</h2>
          <p>Hi ${opts.requesterName},</p>
          <p>Your request to <strong>${opts.memberName}</strong> regarding "<strong>${opts.subject}</strong>" has been sent.</p>
          <p>You'll be notified when they respond.</p>
        `,
      });
    } catch (err) {
      this.logger.error('Failed to send K7 email', err);
    }
  }

  /**
   * K8 — Article submitted for review (to ops team)
   */
  async sendK8ArticleSubmitted(opts: {
    authorName: string;
    articleTitle: string;
    articleId: string;
  }): Promise<void> {
    if (!this.resend) return;
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: this.opsEmail,
        subject: `[Expertly] Article Submitted for Review — ${opts.articleTitle}`,
        html: `
          <h2>Article Submitted for Review</h2>
          <p><strong>Author:</strong> ${opts.authorName}</p>
          <p><strong>Title:</strong> ${opts.articleTitle}</p>
          <p><strong>Article ID:</strong> ${opts.articleId}</p>
          <p>Please review in the admin dashboard.</p>
        `,
      });
    } catch (err) {
      this.logger.error('Failed to send K8 email', err);
    }
  }
}
