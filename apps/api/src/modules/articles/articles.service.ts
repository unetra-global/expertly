import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import sanitizeHtml from 'sanitize-html';
import { SupabaseService } from '../../common/services/supabase.service';
import { CacheService } from '../../common/services/cache.service';
import { EmailService } from '../../common/services/email.service';
import { AuthUser, PaginationMeta } from '@expertly/types';
import {
  slugify,
  randomSuffix,
  countWords,
  calculateReadTime,
  extractExcerpt,
} from '@expertly/utils';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { ArticleAiSearchDto } from './dto/ai-search.dto';

const ARTICLE_TTL = 300; // 5 min

// NEVER select the embedding column
const ARTICLE_LIST_FIELDS =
  'id, title, slug, excerpt, cover_image_url, tags, read_time, published_at, ' +
  'status, word_count, category_id, service_id, creation_mode, submitted_at, ' +
  'author_id, created_at, updated_at';

const ARTICLE_FULL_FIELDS =
  ARTICLE_LIST_FIELDS + ', body';

type ArticleRow = {
  id: string;
  author_id: string;
  status: string;
  word_count?: number | null;
  cover_image_url?: string | null;
  slug: string;
  [key: string]: unknown;
};

function sanitizeBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'blockquote', 'br'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
  });
}

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);
  private openai: OpenAI | null = null;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly cache: CacheService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  // ─── List Articles ────────────────────────────────────────────────────────

  async getList(
    dto: QueryArticlesDto,
    user: AuthUser | null,
  ): Promise<{ data: unknown[]; meta: PaginationMeta }> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, 50);
    const offset = (page - 1) * limit;

    const isAuth = !!user;
    const isMember = user?.role === 'member';

    // Build cache key for public published list
    const cacheKey = !isMember
      ? this.cache.buildKey('articles', 'list', `p${page}l${limit}${dto.categoryId ?? ''}${dto.serviceId ?? ''}`)
      : null;

    if (cacheKey) {
      const cached = await this.cache.get<{ data: unknown[]; meta: PaginationMeta }>(cacheKey);
      if (cached) return cached;
    }

    let query = this.supabase.adminClient
      .from('articles')
      .select(ARTICLE_LIST_FIELDS, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('published_at', { ascending: false });

    if (isMember && user?.memberId) {
      // Members see their own articles at any status
      query = query.eq('author_id', user.memberId);
      if (dto.status) {
        query = query.eq('status', dto.status);
      }
    } else {
      // Guests/users see only published articles
      query = query.eq('status', 'published');
    }

    if (dto.categoryId) {
      query = query.eq('category_id', dto.categoryId);
    }
    if (dto.serviceId) {
      query = query.eq('service_id', dto.serviceId);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);
    const result = {
      data: data ?? [],
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    if (cacheKey) {
      await this.cache.set(cacheKey, result, ARTICLE_TTL);
    }

    return result;
  }

  // ─── Get Member's Own Articles ────────────────────────────────────────────

  async getMemberArticles(user: AuthUser): Promise<unknown[]> {
    if (!user.memberId) return [];

    const { data, error } = await this.supabase.adminClient
      .from('articles')
      .select(ARTICLE_LIST_FIELDS)
      .eq('author_id', user.memberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  // ─── Get By Slug ──────────────────────────────────────────────────────────

  async getBySlug(slug: string, user: AuthUser | null): Promise<unknown> {
    const cacheKey = this.cache.buildKey('articles', 'detail', slug);

    const result = await this.cache.getOrFetch<unknown | null>(
      cacheKey,
      async () => {
        let query = this.supabase.adminClient
          .from('articles')
          .select(ARTICLE_FULL_FIELDS)
          .eq('slug', slug);

        // Only published for non-members
        if (!user?.memberId) {
          query = query.eq('status', 'published');
        }

        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        return data;
      },
      ARTICLE_TTL,
    );

    if (!result) {
      throw new NotFoundException(`Article '${slug}' not found`);
    }

    return result;
  }

  // ─── Get By ID ────────────────────────────────────────────────────────────

  async getById(id: string, user: AuthUser): Promise<unknown> {
    if (!user.memberId) throw new ForbiddenException('Member access required');

    const { data, error } = await this.supabase.adminClient
      .from('articles')
      .select(ARTICLE_FULL_FIELDS)
      .eq('id', id)
      .eq('author_id', user.memberId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundException(`Article '${id}' not found`);
    return data;
  }

  // ─── Get Related Articles ────────────────────────────────────────────────

  async getRelated(id: string): Promise<unknown[]> {
    // Get current article's service/category
    const { data: article } = await this.supabase.adminClient
      .from('articles')
      .select('service_id, category_id')
      .eq('id', id)
      .single();

    if (!article) return [];

    const { service_id, category_id } = article as { service_id?: string; category_id?: string };

    let query = this.supabase.adminClient
      .from('articles')
      .select(ARTICLE_LIST_FIELDS)
      .eq('status', 'published')
      .neq('id', id)
      .limit(4);

    if (service_id) {
      query = query.eq('service_id', service_id);
    } else if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data } = await query;
    return data ?? [];
  }

  // ─── Create Article ───────────────────────────────────────────────────────

  async create(user: AuthUser, dto: CreateArticleDto): Promise<unknown> {
    if (!user.memberId) throw new ForbiddenException('Member access required');

    const sanitizedBody = sanitizeBody(dto.body);
    const words = countWords(sanitizedBody);
    const readTime = calculateReadTime(sanitizedBody);
    const excerpt = extractExcerpt(sanitizedBody);

    // Generate unique slug
    let slug = slugify(dto.title);
    const exists = await this.slugExists(slug);
    if (exists) {
      slug = `${slug}-${randomSuffix(6)}`;
    }

    const { data, error } = await this.supabase.adminClient
      .from('articles')
      .insert({
        author_id: user.memberId,
        title: dto.title,
        slug,
        body: sanitizedBody,
        excerpt,
        cover_image_url: dto.featuredImageUrl ?? null,
        tags: dto.tags ?? [],
        category_id: dto.categoryId ?? null,
        service_id: dto.serviceId ?? null,
        word_count: words,
        read_time: readTime,
        status: 'draft',
        creation_mode: 'manual',
      })
      .select(ARTICLE_FULL_FIELDS)
      .single();

    if (error) throw error;
    return data;
  }

  // ─── Update Article ───────────────────────────────────────────────────────

  async update(user: AuthUser, id: string, dto: UpdateArticleDto): Promise<unknown> {
    if (!user.memberId) throw new ForbiddenException('Member access required');

    const existing = await this.getOwnedArticle(user, id);
    if (!['draft', 'rejected'].includes(existing.status)) {
      throw new BadRequestException('Article can only be edited in draft or rejected status');
    }

    const payload: Record<string, unknown> = {};

    if (dto.title !== undefined) {
      payload.title = dto.title;
      // Re-slug only if title changed significantly
      let slug = slugify(dto.title);
      const exists = await this.slugExists(slug, id);
      if (exists) slug = `${slug}-${randomSuffix(6)}`;
      payload.slug = slug;
    }

    if (dto.body !== undefined) {
      const sanitized = sanitizeBody(dto.body);
      payload.body = sanitized;
      payload.word_count = countWords(sanitized);
      payload.read_time = calculateReadTime(sanitized);
      payload.excerpt = extractExcerpt(sanitized);
    }

    if (dto.categoryId !== undefined) payload.category_id = dto.categoryId;
    if (dto.serviceId !== undefined) payload.service_id = dto.serviceId;
    if (dto.tags !== undefined) payload.tags = dto.tags;
    if (dto.featuredImageUrl !== undefined) payload.cover_image_url = dto.featuredImageUrl;

    const { data, error } = await this.supabase.adminClient
      .from('articles')
      .update(payload)
      .eq('id', id)
      .select(ARTICLE_FULL_FIELDS)
      .single();

    if (error) throw error;

    // Invalidate cache
    await this.invalidateArticleCache(existing.slug);

    return data;
  }

  // ─── Delete Article ───────────────────────────────────────────────────────

  async delete(user: AuthUser, id: string): Promise<{ message: string }> {
    if (!user.memberId) throw new ForbiddenException('Member access required');

    const existing = await this.getOwnedArticle(user, id);
    if (existing.status !== 'draft') {
      throw new BadRequestException('Only draft articles can be deleted');
    }

    const { error } = await this.supabase.adminClient
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Article deleted' };
  }

  // ─── Submit Article ───────────────────────────────────────────────────────

  async submit(user: AuthUser, id: string): Promise<unknown> {
    if (!user.memberId) throw new ForbiddenException('Member access required');

    const existing = await this.getOwnedArticle(user, id);

    // Validate word count
    const wordCount = existing.word_count ?? 0;
    if (wordCount < 300) {
      throw new BadRequestException('Article must be at least 300 words');
    }

    // Validate cover image
    if (!existing.cover_image_url) {
      throw new BadRequestException('Article must have a featured image');
    }

    // Validate max articles in review
    const { count } = await this.supabase.adminClient
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', user.memberId)
      .in('status', ['submitted', 'under_review']);

    if ((count ?? 0) >= 2) {
      throw new ConflictException('MAX_ARTICLES_IN_REVIEW');
    }

    const { data, error } = await this.supabase.adminClient
      .from('articles')
      .update({ status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('id', id)
      .select(ARTICLE_FULL_FIELDS)
      .single();

    if (error) throw error;

    // Send K8 to ops
    const article = data as unknown as ArticleRow;
    const { data: memberData } = await this.supabase.adminClient
      .from('members')
      .select('users!user_id(first_name, last_name)')
      .eq('id', user.memberId)
      .single();

    const authorName = memberData
      ? (() => {
          const u = (memberData as Record<string, unknown>).users as
            | { first_name: string; last_name: string }
            | null;
          return u ? `${u.first_name} ${u.last_name}`.trim() : 'Unknown';
        })()
      : 'Unknown';

    await this.email.sendK8ArticleSubmitted({
      authorName,
      articleTitle: article.title as string,
      articleId: id,
    });

    // Invalidate member's article cache
    await this.cache.delByPattern(this.cache.buildKey('articles', 'list', '*'));

    return data;
  }

  // ─── AI Search ────────────────────────────────────────────────────────────

  async aiSearch(dto: ArticleAiSearchDto): Promise<unknown[]> {
    if (!this.openai) {
      throw new BadRequestException('AI search not configured');
    }

    const embeddingResp = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: dto.query,
    });

    const embedding = embeddingResp.data[0]?.embedding;
    if (!embedding) return [];

    const { data: rpcResults, error } = await this.supabase.adminClient.rpc(
      'search_articles',
      {
        query_embedding: embedding,
        similarity_threshold: 0.6,
        match_count: 20,
      },
    );

    if (error || !rpcResults || (rpcResults as unknown[]).length === 0) {
      return [];
    }

    const ids = (rpcResults as Array<{ id: string; similarity: number }>).map((r) => r.id);
    const simMap = new Map<string, number>(
      (rpcResults as Array<{ id: string; similarity: number }>).map((r) => [r.id, r.similarity]),
    );

    const { data: articles } = await this.supabase.adminClient
      .from('articles')
      .select(ARTICLE_LIST_FIELDS)
      .in('id', ids)
      .eq('status', 'published');

    if (!articles) return [];

    return (articles as unknown as Array<Record<string, unknown>>)
      .map((a) => ({ ...a, similarity: simMap.get(a.id as string) ?? 0 }))
      .sort((a, b) => (b.similarity as number) - (a.similarity as number));
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase.adminClient
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count } = await query;
    return (count ?? 0) > 0;
  }

  private async getOwnedArticle(user: AuthUser, id: string): Promise<ArticleRow> {
    const { data, error } = await this.supabase.adminClient
      .from('articles')
      .select(ARTICLE_FULL_FIELDS)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundException(`Article '${id}' not found`);

    const article = data as unknown as ArticleRow;
    if (article.author_id !== user.memberId) {
      throw new ForbiddenException('Access denied');
    }

    return article;
  }

  private async invalidateArticleCache(slug: string): Promise<void> {
    await Promise.all([
      this.cache.del(this.cache.buildKey('articles', 'detail', slug)),
      this.cache.delByPattern(this.cache.buildKey('articles', 'list', '*')),
    ]);
  }
}
