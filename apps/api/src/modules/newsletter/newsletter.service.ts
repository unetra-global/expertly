import {
  Injectable,
  Logger,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmailService } from '../../common/services/email.service';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
}

interface GuestSubscriptionRow {
  id: string;
}

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly email: EmailService,
  ) {}

  // ─── Subscribe (guest) ────────────────────────────────────────────────────────

  async subscribe(opts: {
    name: string;
    email: string;
    categoryIds: string[];
  }): Promise<{ message: string }> {
    const sb = this.supabase.adminClient;

    // Check if this email is already subscribed to any category
    const { data: existing } = await sb
      .from('guest_newsletter_subscriptions')
      .select('id')
      .eq('email', opts.email)
      .maybeSingle() as { data: GuestSubscriptionRow | null };

    if (existing) {
      throw new ConflictException({
        code: 'NEWSLETTER_ALREADY_SUBSCRIBED',
        message: 'This email is already subscribed to our newsletter.',
      });
    }

    // Insert one row per selected category
    const rows = opts.categoryIds.map((categoryId) => ({
      name: opts.name,
      email: opts.email,
      category_id: categoryId,
      is_active: true,
    }));

    const { error } = await sb
      .from('guest_newsletter_subscriptions')
      .insert(rows);

    if (error) {
      this.logger.error(`Newsletter subscribe failed for ${opts.email}: ${error.message} | code: ${error.code}`);
      throw new InternalServerErrorException({
        code: 'NEWSLETTER_SUBSCRIBE_FAILED',
        message: 'Failed to save your subscription. Please try again.',
      });
    }

    this.logger.log(`Newsletter subscription created for ${opts.email} — ${opts.categoryIds.length} categories`);

    // Send welcome confirmation email — resolve category names first
    try {
      const { data: cats } = await sb
        .from('categories')
        .select('name')
        .in('id', opts.categoryIds) as { data: Array<{ name: string }> | null };

      await this.email.sendK23NewsletterWelcome({
        to: opts.email,
        name: opts.name,
        categoryNames: (cats ?? []).map((c) => c.name),
      });
    } catch (emailErr) {
      // Non-fatal — subscription already saved, just log the failure
      this.logger.warn(`Newsletter welcome email failed for ${opts.email}: ${(emailErr as Error).message}`);
    }

    return { message: 'Successfully subscribed to the newsletter.' };
  }

  // ─── Get Categories ───────────────────────────────────────────────────────────

  async getCategories(): Promise<CategoryRow[]> {
    const { data, error } = await this.supabase.adminClient
      .from('categories')
      .select('id, name, slug')
      .neq('name', 'Others')
      .order('name') as { data: CategoryRow[] | null; error: unknown };

    if (error) {
      this.logger.error(`Failed to fetch categories: ${String(error)}`);
      return [];
    }

    return data ?? [];
  }
}
