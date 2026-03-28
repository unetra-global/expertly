import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { SupabaseService } from './supabase.service';

// ── Base HTML template ─────────────────────────────────────────────────────

function baseHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:24px 32px;">
            <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">EXPERTLY</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 24px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f1f5f9;padding:16px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
              You received this email because you are a member of Expertly or submitted an application.
              To manage email preferences, log in to your account settings.<br/>
              &copy; ${new Date().getFullYear()} Expertly. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1e293b;">${text}</p>`;
}

function h2(text: string): string {
  return `<h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#0f172a;">${text}</h2>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:14px;color:#64748b;width:160px;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500;">${value}</td>
  </tr>`;
}

function infoTable(rows: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin-bottom:20px;width:100%;">${rows}</table>`;
}

function btn(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;margin-top:8px;">${label}</a>`;
}

function highlight(text: string): string {
  return `<div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px 20px;border-radius:4px;margin-bottom:20px;font-size:14px;color:#0f172a;">${text}</div>`;
}

// ── Email Service ──────────────────────────────────────────────────────────

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT', 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
      this.logger.log(`SMTP configured → ${host}:${port} as ${user}`);
    } else {
      this.logger.warn('SMTP_HOST/SMTP_USER/SMTP_PASS not set — email sending disabled');
    }
  }

  private get opsEmail(): string {
    return this.config.get<string>('OPS_EMAIL', 'ops@expertly.global');
  }

  private get fromEmail(): string {
    return this.config.get<string>('FROM_EMAIL', 'noreply@expertly.global');
  }

  private get appUrl(): string {
    return this.config.get<string>('APP_URL', 'https://expertly.global');
  }

  // ── Raw send (no template, no log) — for testing only ────────────────────

  async sendRaw(opts: { to: string; subject: string; html: string }): Promise<void> {
    if (!this.transporter) {
      throw new Error('SMTP not configured — check SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
    }
    await this.transporter.sendMail({
      from: this.fromEmail,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  }

  // ── Core send + log ───────────────────────────────────────────────────────

  private async send(opts: {
    to: string;
    subject: string;
    html: string;
    template: string;
    variables?: Record<string, unknown>;
  }): Promise<void> {
    const { to, subject, html, template, variables } = opts;
    let status: 'sent' | 'failed' = 'sent';
    let sendError: string | null = null;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromEmail,
          to,
          subject,
          html,
        });
      } catch (err) {
        status = 'failed';
        sendError = (err as Error).message;
        this.logger.error(`Failed to send ${template} to ${to}: ${sendError}`);
      }
    }

    // Log to email_logs table
    try {
      await this.supabase.adminClient.from('email_logs').insert({
        template,
        to_email: to,
        subject,
        variables: variables ?? {},
        status,
        error: sendError,
        sent_at: new Date().toISOString(),
      });
    } catch (logErr) {
      this.logger.warn(`Failed to log email: ${(logErr as Error).message}`);
    }
  }

  // ── Generic dispatcher ────────────────────────────────────────────────────

  async sendEmail(
    template: string,
    to: string,
    variables: Record<string, unknown>,
  ): Promise<void> {
    switch (template) {
      case 'K1':
        return this.sendK1ApplicationSubmitted({
          applicantName: String(variables.applicantName ?? ''),
          applicantEmail: String(variables.applicantEmail ?? ''),
          applicationId: String(variables.applicationId ?? ''),
        });
      case 'K2':
        return this.sendK2ApplicationApproved({
          to,
          applicantName: String(variables.applicantName ?? ''),
          applicationId: String(variables.applicationId ?? ''),
          firstName: variables.firstName ? String(variables.firstName) : undefined,
          lastName: variables.lastName ? String(variables.lastName) : undefined,
          serviceAssigned: variables.serviceAssigned ? String(variables.serviceAssigned) : undefined,
          tier: variables.tier ? String(variables.tier) : undefined,
        });
      case 'K3':
        return this.sendK3ApplicationRejected({
          to,
          applicantName: String(variables.applicantName ?? ''),
          rejectionReason: String(variables.rejectionReason ?? ''),
        });
      case 'K4':
        return this.sendK4ApplicationWaitlisted({
          to,
          applicantName: String(variables.applicantName ?? ''),
        });
      case 'K5':
        return this.sendK5SeatOpened({
          to,
          applicantName: String(variables.applicantName ?? ''),
          serviceName: String(variables.serviceName ?? ''),
        });
      case 'K6':
        return this.sendK6ConsultationReceived({
          memberEmail: to,
          memberName: String(variables.memberName ?? ''),
          requesterEmail: String(variables.requesterEmail ?? ''),
          requesterName: String(variables.requesterName ?? ''),
          subject: String(variables.subject ?? ''),
        });
      case 'K7':
        return this.sendK7ConsultationConfirmation({
          requesterEmail: to,
          requesterName: String(variables.requesterName ?? ''),
          memberName: String(variables.memberName ?? ''),
          subject: String(variables.subject ?? ''),
        });
      case 'K8':
        return this.sendK8ArticleSubmitted({
          authorName: String(variables.authorName ?? ''),
          articleTitle: String(variables.articleTitle ?? ''),
          articleId: String(variables.articleId ?? ''),
        });
      case 'K9':
        return this.sendK9ArticleApproved({
          to,
          authorName: String(variables.authorName ?? ''),
          articleTitle: String(variables.articleTitle ?? ''),
          articleSlug: String(variables.articleSlug ?? ''),
        });
      case 'K10':
        return this.sendK10ArticleRejected({
          to,
          authorName: String(variables.authorName ?? ''),
          articleTitle: String(variables.articleTitle ?? ''),
          rejectionReason: String(variables.rejectionReason ?? ''),
        });
      case 'K11':
        return this.sendK11VerifiedBadgeRemoved({
          to,
          memberName: String(variables.memberName ?? ''),
          reason: String(variables.reason ?? ''),
        });
      case 'K12':
        return this.sendK12VerifiedBadgeAwarded({
          to,
          memberName: String(variables.memberName ?? ''),
        });
      case 'K13':
        return this.sendK13RenewalReminder({
          to,
          memberName: String(variables.memberName ?? ''),
          expiryDate: String(variables.expiryDate ?? ''),
          daysUntilExpiry: Number(variables.daysUntilExpiry ?? 30),
        });
      case 'K14':
        return this.sendK14MembershipExpired({
          to,
          memberName: String(variables.memberName ?? ''),
        });
      case 'K15':
        return this.sendK15WeeklyDigest({
          to,
          memberName: String(variables.memberName ?? ''),
          categoryName: String(variables.categoryName ?? ''),
          articles: variables.articles as Array<{ title: string; slug: string; authorName: string }>,
        });
      case 'K16':
        return this.sendK16RegulatoryNudge({
          to,
          memberName: String(variables.memberName ?? ''),
          updateTitle: String(variables.updateTitle ?? ''),
          updateSummary: String(variables.updateSummary ?? ''),
          source: String(variables.source ?? ''),
        });
      case 'K17':
        return this.sendK17MemberActivated({
          to,
          memberName: String(variables.memberName ?? ''),
          memberSlug: String(variables.memberSlug ?? ''),
        });
      case 'K18':
        return this.sendK18UserWelcome({
          to,
          firstName: String(variables.firstName ?? ''),
        });
      case 'K19':
        return this.sendK19ServiceChangeApproved({
          to,
          memberName: String(variables.memberName ?? ''),
          newServiceName: String(variables.newServiceName ?? ''),
        });
      case 'K20':
        return this.sendK20ServiceChangeRejected({
          to,
          memberName: String(variables.memberName ?? ''),
          rejectionReason: String(variables.rejectionReason ?? ''),
        });
      case 'K21':
        return this.sendK21ArticleArchived({
          to,
          authorName: String(variables.authorName ?? ''),
          articleTitle: String(variables.articleTitle ?? ''),
          reason: String(variables.reason ?? ''),
        });
      case 'K22':
        return this.sendK22MembershipRenewed({
          to,
          memberName: String(variables.memberName ?? ''),
          newExpiryDate: String(variables.newExpiryDate ?? ''),
        });
      default:
        this.logger.warn(`Unknown email template: ${template}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K1 — New application submitted (to ops)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK1ApplicationSubmitted(opts: {
    applicantName: string;
    applicantEmail: string;
    applicationId: string;
  }): Promise<void> {
    const html = baseHtml(
      'New Member Application',
      h2('New Member Application') +
        infoTable(
          infoRow('Applicant', opts.applicantName) +
            infoRow('Email', opts.applicantEmail) +
            infoRow('Application ID', opts.applicationId),
        ) +
        p('A new membership application has been submitted. Please review it in the admin dashboard.'),
    );
    await this.send({
      to: this.opsEmail,
      subject: `[Expertly] New Application — ${opts.applicantName}`,
      html,
      template: 'K1',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K2 — Application approved (to applicant) — includes bank transfer details
  // ─────────────────────────────────────────────────────────────────────────

  async sendK2ApplicationApproved(opts: {
    to: string;
    applicantName: string;
    applicationId: string;
    firstName?: string;
    lastName?: string;
    serviceAssigned?: string;
    tier?: string;
  }): Promise<void> {
    const bankName = this.config.get<string>('PAYMENT_BANK_NAME', 'Expertly Ltd Bank');
    const accountNumber = this.config.get<string>('PAYMENT_ACCOUNT_NUMBER', '');
    const sortCode = this.config.get<string>('PAYMENT_SORT_CODE', '');
    const amountUsd = this.config.get<string>('PAYMENT_AMOUNT_USD', '');

    const referenceCode =
      opts.firstName && opts.lastName
        ? `EXPERTLY-${opts.firstName.toUpperCase()}-${opts.lastName.toUpperCase()}`
        : opts.applicationId;

    const html = baseHtml(
      'Application Approved',
      h2('Congratulations — Your Application Has Been Approved!') +
        p(`Dear ${opts.applicantName},`) +
        p('We are delighted to inform you that your application to join Expertly has been approved. To complete your membership, please make payment using the bank transfer details below.') +
        highlight(
          `<strong>Bank:</strong> ${bankName}<br/>` +
            `<strong>Account Number:</strong> ${accountNumber}<br/>` +
            `<strong>Sort Code:</strong> ${sortCode}<br/>` +
            `<strong>Amount:</strong> $${amountUsd} USD<br/>` +
            `<strong>Reference:</strong> ${referenceCode}`,
        ) +
        p(`Please make payment of $${amountUsd} USD via bank transfer. Once payment is confirmed, our team will activate your account within 1 business day.`) +
        p('Welcome to Expertly!'),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Application Approved — Next Steps`,
      html,
      template: 'K2',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K3 — Application rejected (to applicant)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK3ApplicationRejected(opts: {
    to: string;
    applicantName: string;
    rejectionReason: string;
  }): Promise<void> {
    const html = baseHtml(
      'Application Update',
      h2('Application Decision') +
        p(`Dear ${opts.applicantName},`) +
        p('Thank you for your interest in joining Expertly. After careful review, we are unable to approve your application at this time.') +
        highlight(`<strong>Reason:</strong> ${opts.rejectionReason}`) +
        p('You are welcome to re-apply after 6 months. If you have questions, please contact our team at <a href="mailto:ops@expertly.global">ops@expertly.global</a>.'),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Application Update`,
      html,
      template: 'K3',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K4 — Application waitlisted (to applicant)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK4ApplicationWaitlisted(opts: {
    to: string;
    applicantName: string;
  }): Promise<void> {
    const html = baseHtml(
      'Application Waitlisted',
      h2('You\'re on the Waitlist') +
        p(`Dear ${opts.applicantName},`) +
        p('Thank you for applying to Expertly. We have received your application and have added you to our waitlist.') +
        p('We will contact you as soon as a spot becomes available. We appreciate your patience and interest in our platform.'),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] You're on the Waitlist`,
      html,
      template: 'K4',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K5 — Seat opened broadcast (to waitlisted applicants for that service)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK5SeatOpened(opts: {
    to: string;
    applicantName: string;
    serviceName: string;
  }): Promise<void> {
    const html = baseHtml(
      'A Spot Has Opened',
      h2(`Good news — a spot has opened for ${opts.serviceName}!`) +
        p(`Dear ${opts.applicantName},`) +
        p(`Great news! A spot has become available for <strong>${opts.serviceName}</strong> on Expertly. You are invited to re-apply now.`) +
        btn('Apply Now', `${this.appUrl}/apply`) +
        p('Spots fill quickly — act soon!'),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Good news — a spot has opened for ${opts.serviceName}`,
      html,
      template: 'K5',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K6 — Consultation request received (to member)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK6ConsultationReceived(opts: {
    memberEmail: string;
    memberName: string;
    requesterEmail: string;
    requesterName: string;
    subject: string;
  }): Promise<void> {
    const html = baseHtml(
      'New Consultation Request',
      h2('You Have a New Consultation Request') +
        p(`Dear ${opts.memberName},`) +
        infoTable(
          infoRow('From', `${opts.requesterName} &lt;${opts.requesterEmail}&gt;`) +
            infoRow('Subject', opts.subject),
        ) +
        p(`You can reply directly to this email to respond to ${opts.requesterName}, or log in to Expertly to manage the request.`) +
        btn('View in Dashboard', `${this.appUrl}/member/consultations`),
    );
    await this.send({
      to: opts.memberEmail,
      subject: `[Expertly] New Consultation Request — ${opts.subject}`,
      html,
      template: 'K6',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K7 — Consultation request confirmation (to requester)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK7ConsultationConfirmation(opts: {
    requesterEmail: string;
    requesterName: string;
    memberName: string;
    subject: string;
  }): Promise<void> {
    const html = baseHtml(
      'Consultation Request Sent',
      h2('Your Consultation Request Has Been Sent') +
        p(`Dear ${opts.requesterName},`) +
        p(`Your consultation request to <strong>${opts.memberName}</strong> regarding "<strong>${opts.subject}</strong>" has been sent.`) +
        p('You will be notified by email when they respond.'),
    );
    await this.send({
      to: opts.requesterEmail,
      subject: `[Expertly] Consultation Request Sent — ${opts.subject}`,
      html,
      template: 'K7',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K8 — Article submitted for review (to ops)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK8ArticleSubmitted(opts: {
    authorName: string;
    articleTitle: string;
    articleId: string;
  }): Promise<void> {
    const html = baseHtml(
      'Article Submitted for Review',
      h2('Article Submitted for Review') +
        infoTable(
          infoRow('Author', opts.authorName) +
            infoRow('Title', opts.articleTitle) +
            infoRow('Article ID', opts.articleId),
        ) +
        p('Please review this article in the admin dashboard.'),
    );
    await this.send({
      to: this.opsEmail,
      subject: `[Expertly] Article for Review — ${opts.articleTitle}`,
      html,
      template: 'K8',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K9 — Article approved (to author)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK9ArticleApproved(opts: {
    to: string;
    authorName: string;
    articleTitle: string;
    articleSlug: string;
  }): Promise<void> {
    const articleUrl = `${this.appUrl}/articles/${opts.articleSlug}`;
    const html = baseHtml(
      'Article Approved',
      h2('Your Article Has Been Approved!') +
        p(`Dear ${opts.authorName},`) +
        p(`Great news! Your article "<strong>${opts.articleTitle}</strong>" has been reviewed and approved. It is now live on the Expertly platform.`) +
        btn('Read Your Article', articleUrl),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Article Approved — ${opts.articleTitle}`,
      html,
      template: 'K9',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K10 — Article rejected (to author)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK10ArticleRejected(opts: {
    to: string;
    authorName: string;
    articleTitle: string;
    rejectionReason: string;
  }): Promise<void> {
    const html = baseHtml(
      'Article Needs Revision',
      h2('Article Returned for Revision') +
        p(`Dear ${opts.authorName},`) +
        p(`Your article "<strong>${opts.articleTitle}</strong>" has been reviewed and requires revision before it can be published.`) +
        highlight(`<strong>Reviewer's feedback:</strong><br/>${opts.rejectionReason}`) +
        p('Please log in to your dashboard to revise and resubmit.') +
        btn('Edit Article', `${this.appUrl}/member/articles`),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Article Revision Required — ${opts.articleTitle}`,
      html,
      template: 'K10',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K11 — Verified badge removed (to member)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK11VerifiedBadgeRemoved(opts: {
    to: string;
    memberName: string;
    reason: string;
  }): Promise<void> {
    const html = baseHtml(
      'Verified Badge Update',
      h2('Your Verified Badge Has Been Removed') +
        p(`Dear ${opts.memberName},`) +
        p('Your Expertly Verified badge has been temporarily removed pending a review of your profile.') +
        highlight(`<strong>Reason:</strong> ${opts.reason}`) +
        p('To restore your badge, please update your profile and contact our team at <a href="mailto:ops@expertly.global">ops@expertly.global</a>.'),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Verified Badge Update`,
      html,
      template: 'K11',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K12 — Verified badge awarded (to member)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK12VerifiedBadgeAwarded(opts: {
    to: string;
    memberName: string;
  }): Promise<void> {
    const html = baseHtml(
      'Verified Badge Awarded',
      h2('You\'ve Earned the Expertly Verified Badge!') +
        p(`Dear ${opts.memberName},`) +
        p('Congratulations! After reviewing your credentials and experience, we are pleased to award you the <strong>Expertly Verified</strong> badge.') +
        p('This badge will appear on your public profile, signalling to prospective clients that your qualifications have been independently verified by the Expertly team.') +
        btn('View Your Profile', `${this.appUrl}/member/profile`),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] You've Earned the Verified Badge!`,
      html,
      template: 'K12',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K13 — Renewal reminder (to member, ~30 days before expiry)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK13RenewalReminder(opts: {
    to: string;
    memberName: string;
    expiryDate: string;
    daysUntilExpiry: number;
  }): Promise<void> {
    const html = baseHtml(
      'Membership Renewal Reminder',
      h2('Your Membership is Expiring Soon') +
        p(`Dear ${opts.memberName},`) +
        p(`This is a friendly reminder that your Expertly membership will expire in <strong>${opts.daysUntilExpiry} days</strong> on <strong>${opts.expiryDate}</strong>.`) +
        p('To continue enjoying uninterrupted access to Expertly, please renew your membership by contacting our team.') +
        btn('Contact Us to Renew', `mailto:ops@expertly.global?subject=Membership%20Renewal`),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Membership Renewal Reminder — ${opts.daysUntilExpiry} Days Left`,
      html,
      template: 'K13',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K14 — Membership expired (to member)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK14MembershipExpired(opts: {
    to: string;
    memberName: string;
  }): Promise<void> {
    const html = baseHtml(
      'Membership Expired',
      h2('Your Expertly Membership Has Expired') +
        p(`Dear ${opts.memberName},`) +
        p('Your Expertly membership has expired. Your profile has been unlisted from the platform and you will no longer be able to receive consultation requests.') +
        p('To reinstate your membership and profile, please contact our team.') +
        btn('Contact Us', `mailto:ops@expertly.global?subject=Membership%20Renewal`),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Your Membership Has Expired`,
      html,
      template: 'K14',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K15 — Weekly/fortnightly article digest (to subscriber)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK15WeeklyDigest(opts: {
    to: string;
    memberName: string;
    categoryName: string;
    articles: Array<{ title: string; slug: string; authorName: string }>;
  }): Promise<void> {
    const articleList = (opts.articles ?? [])
      .map(
        (a) =>
          `<li style="margin-bottom:12px;">
            <a href="${this.appUrl}/articles/${a.slug}" style="font-size:15px;font-weight:600;color:#2563eb;text-decoration:none;">${a.title}</a>
            <br/><span style="font-size:13px;color:#64748b;">by ${a.authorName}</span>
          </li>`,
      )
      .join('');

    const html = baseHtml(
      `${opts.categoryName} Digest`,
      h2(`Your Weekly ${opts.categoryName} Digest`) +
        p(`Dear ${opts.memberName ?? 'Member'},`) +
        p(`Here are the latest expert articles in <strong>${opts.categoryName}</strong> from this week:`) +
        `<ul style="padding-left:20px;margin:0 0 20px;">${articleList}</ul>` +
        btn('View All Articles', `${this.appUrl}/articles`),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Your ${opts.categoryName} Digest`,
      html,
      template: 'K15',
      variables: opts as unknown as Record<string, unknown>,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K16 — Regulatory update nudge (to relevant member)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK16RegulatoryNudge(opts: {
    to: string;
    memberName: string;
    updateTitle: string;
    updateSummary: string;
    source: string;
  }): Promise<void> {
    const html = baseHtml(
      'Regulatory Update — Write About It',
      h2('New Regulatory Update in Your Practice Area') +
        p(`Dear ${opts.memberName},`) +
        p('A regulatory update relevant to your practice area has been published. This is a great opportunity to share your expertise with the Expertly community.') +
        highlight(
          `<strong>${opts.updateTitle}</strong><br/>${opts.updateSummary}<br/>` +
            `<small style="color:#64748b;">Source: ${opts.source}</small>`,
        ) +
        p('Would you like to write a short article explaining this update and its implications for practitioners or clients? Your insights would be highly valuable.') +
        btn('Write an Article', `${this.appUrl}/member/articles/new`),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] New Regulatory Update — Share Your Expertise`,
      html,
      template: 'K16',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K17 — Member activated (to new member)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK17MemberActivated(opts: {
    to: string;
    memberName: string;
    memberSlug: string;
  }): Promise<void> {
    const profileUrl = `${this.appUrl}/members/${opts.memberSlug}`;
    const html = baseHtml(
      'Welcome to Expertly',
      h2('Welcome to Expertly — Your Membership is Active!') +
        p(`Dear ${opts.memberName},`) +
        p('We are thrilled to welcome you to Expertly! Your membership has been activated and your profile is now live on the platform.') +
        p('Here\'s what you can do next:') +
        `<ul style="padding-left:20px;margin:0 0 20px;font-size:15px;color:#1e293b;line-height:1.8;">
          <li>Complete your profile to attract more clients</li>
          <li>Write your first article to showcase your expertise</li>
          <li>Respond to consultation requests from prospective clients</li>
        </ul>` +
        btn('View Your Profile', profileUrl),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Welcome — Your Membership is Active!`,
      html,
      template: 'K17',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K18 — User welcome on signup
  // ─────────────────────────────────────────────────────────────────────────

  async sendK18UserWelcome(opts: {
    to: string;
    firstName: string;
  }): Promise<void> {
    const html = baseHtml(
      'Welcome to Expertly',
      h2('Welcome to Expertly') +
        p(`Dear ${opts.firstName},`) +
        p('Thank you for joining Expertly — the professional network for finance and legal experts.') +
        p('To get started, complete your application to become a verified member and connect with clients looking for your expertise.') +
        btn('Start Your Application', `${this.appUrl}/apply`),
    );
    await this.send({
      to: opts.to,
      subject: `Welcome to Expertly`,
      html,
      template: 'K18',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Service change ACK — not a K-numbered template; sent on service change request
  // ─────────────────────────────────────────────────────────────────────────

  async sendServiceChangeAck(opts: {
    to: string;
    memberName: string;
    newServiceName: string;
  }): Promise<void> {
    const html = baseHtml(
      'Service Change Request Received',
      h2('Service Change Request Received') +
        p(`Dear ${opts.memberName},`) +
        p(`We have received your request to change your primary service area to <strong>${opts.newServiceName}</strong>.`) +
        p('Our team will review your request within 3–5 business days. You will receive an email once a decision has been made.'),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Service Change Request Received`,
      html,
      template: 'service_change_ack',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K19 — Service change approved (to member)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK19ServiceChangeApproved(opts: {
    to: string;
    memberName: string;
    newServiceName: string;
  }): Promise<void> {
    const html = baseHtml(
      'Service Change Approved',
      h2('Your Service Change Has Been Approved') +
        p(`Dear ${opts.memberName},`) +
        p(`Your request to change your primary service area to <strong>${opts.newServiceName}</strong> has been approved.`) +
        p('Your profile has been updated. Please review your listing to ensure everything looks correct.') +
        btn('View Profile', `${this.appUrl}/member/profile`),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Service Change Approved`,
      html,
      template: 'K19',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K20 — Service change rejected (to member)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK20ServiceChangeRejected(opts: {
    to: string;
    memberName: string;
    rejectionReason: string;
  }): Promise<void> {
    const html = baseHtml(
      'Service Change Declined',
      h2('Service Change Request Declined') +
        p(`Dear ${opts.memberName},`) +
        p('After reviewing your service change request, we are unable to approve it at this time.') +
        highlight(`<strong>Reason:</strong> ${opts.rejectionReason}`) +
        p('If you have questions, please contact us at <a href="mailto:ops@expertly.global">ops@expertly.global</a>.'),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Service Change Request Declined`,
      html,
      template: 'K20',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K21 — Article archived (to author)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK21ArticleArchived(opts: {
    to: string;
    authorName: string;
    articleTitle: string;
    reason: string;
  }): Promise<void> {
    const html = baseHtml(
      'Article Archived',
      h2('Your Article Has Been Archived') +
        p(`Dear ${opts.authorName},`) +
        p(`Your article "<strong>${opts.articleTitle}</strong>" has been archived and is no longer publicly visible on the platform.`) +
        highlight(`<strong>Reason:</strong> ${opts.reason}`) +
        p('If you believe this was in error, please contact us at <a href="mailto:ops@expertly.global">ops@expertly.global</a>.'),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Article Archived — ${opts.articleTitle}`,
      html,
      template: 'K21',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K22 — Membership renewed (to member)
  // ─────────────────────────────────────────────────────────────────────────

  async sendK22MembershipRenewed(opts: {
    to: string;
    memberName: string;
    newExpiryDate: string;
  }): Promise<void> {
    const html = baseHtml(
      'Membership Renewed',
      h2('Your Membership Has Been Renewed') +
        p(`Dear ${opts.memberName},`) +
        p('Thank you for renewing your Expertly membership! Your membership is now active.') +
        infoTable(infoRow('New Expiry Date', opts.newExpiryDate)) +
        p('We look forward to continuing to support your practice.') +
        btn('Go to Dashboard', `${this.appUrl}/member/dashboard`),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] Membership Renewed`,
      html,
      template: 'K22',
      variables: opts,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // K23 — Guest newsletter subscription confirmation
  // ─────────────────────────────────────────────────────────────────────────

  async sendK23NewsletterWelcome(opts: {
    to: string;
    name: string;
    categoryNames: string[];
  }): Promise<void> {
    const categoryList = opts.categoryNames
      .map((c) => `<li style="margin-bottom:6px;font-size:14px;color:#1e293b;">${c}</li>`)
      .join('');
    const html = baseHtml(
      'Welcome to Expertly Newsletter',
      h2(`Welcome, ${opts.name}!`) +
        p('Thank you for subscribing to the Expertly newsletter. You\'ll receive a daily digest of expert articles in the areas you selected:') +
        `<ul style="padding-left:20px;margin:0 0 20px;">${categoryList}</ul>` +
        p('We send one digest per day, every morning. You\'ll start receiving articles published from today onwards.') +
        btn('Explore Expert Articles', `${this.appUrl}/articles`),
    );
    await this.send({
      to: opts.to,
      subject: `[Expertly] You're subscribed to our newsletter`,
      html,
      template: 'K23',
      variables: opts as unknown as Record<string, unknown>,
    });
  }
}
