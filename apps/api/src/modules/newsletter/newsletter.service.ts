import { Injectable, Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmailService } from '../../common/services/email.service';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
}

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly email: EmailService,
  ) {}

  async subscribe(opts: {
    userId: string;
    email: string;
    categoryIds: string[];
  }): Promise<{ message: string }> {
    const sb = this.supabase.adminClient;

    // Check for existing active subscription on any of the requested categories
    const { data: existing } = await sb
      .from('user_digest_subscriptions')
      .select('id')
      .eq('user_id', opts.userId)
      .in('category_id', opts.categoryIds)
      .eq('is_active', true)
      .maybeSingle();

    if (existing) {
      throw new ConflictException({
        code: 'NEWSLETTER_ALREADY_SUBSCRIBED',
        message: 'You are already subscribed to one or more of these categories.',
      });
    }

    const rows = opts.categoryIds.map((categoryId) => ({
      user_id: opts.userId,
      email: opts.email,
      category_id: categoryId,
      is_active: true,
      frequency: 'weekly',
    }));

    const { error } = await sb
      .from('user_digest_subscriptions')
      .insert(rows);

    if (error) {
      this.logger.error(`Newsletter subscribe failed for ${opts.email}: ${error.message}`);
      throw new InternalServerErrorException({
        code: 'NEWSLETTER_SUBSCRIBE_FAILED',
        message: 'Failed to save your subscription. Please try again.',
      });
    }

    this.logger.log(`Newsletter subscription created for ${opts.email} — ${opts.categoryIds.length} categories`);

    try {
      const { data: cats } = await sb
        .from('categories')
        .select('name')
        .in('id', opts.categoryIds) as { data: Array<{ name: string }> | null };

      await this.email.sendK23NewsletterWelcome({
        to: opts.email,
        name: opts.email,
        categoryNames: (cats ?? []).map((c) => c.name),
      });
    } catch (emailErr) {
      this.logger.warn(`Newsletter welcome email failed for ${opts.email}: ${(emailErr as Error).message}`);
    }

    return { message: 'Successfully subscribed to the newsletter.' };
  }

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
