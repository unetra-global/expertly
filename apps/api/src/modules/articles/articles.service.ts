import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { generateText, streamText } from 'ai';
import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import sanitizeHtml from 'sanitize-html';
import { SupabaseService } from '../../common/services/supabase.service';
import { CacheService } from '../../common/services/cache.service';
import { EmailService } from '../../common/services/email.service';
import { EmbeddingService } from '../../common/services/embedding.service';
import { QUEUE_NAMES, QUEUE_JOB_TYPES, getQueueConnection, isQueueDisabled } from '../../config/queue.config';
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
import { GenerateArticleDto } from './dto/generate-article.dto';

const ARTICLE_TTL = 300; // 5 min

// System member used when ops / backend_admin authors articles.
// Lazily created by ensureEditorialMember() — see that method for details.
// The member id is fixed; the user id (public.users) is generated because
// public.users.supabase_uid has a FK to auth.users(id), which must be a real
// auth user created via the admin API.
const EDITORIAL_MEMBER_ID = '00000000-0000-0000-0000-000000000e10';

const LEGAL_DISCLAIMER_HTML = `
  <hr style="margin: 32px 0; border-color: #e5e7eb">
  <p style="font-size: 13px; color: #6b7280; font-style: italic">
    This article is for informational purposes only and does not
    constitute professional advice. Always consult a qualified
    professional before acting on any information herein.
  </p>
`;

// ─── AI generation helpers ───────────────────────────────────────────────────

const INJECTION_KEYWORDS = [
  'ignore',
  'forget',
  'disregard',
  'previous instructions',
  'system prompt',
  'you are now',
];

type AiModel =
  | ReturnType<ReturnType<typeof createOpenAI>>
  | ReturnType<ReturnType<typeof createGoogleGenerativeAI>>
  | ReturnType<ReturnType<typeof createAnthropic>>;

interface GeneratedArticlePayload {
  title: string;
  body: string;
  tags: string[];
  featuredImageUrl?: string;
  categoryId?: string;
}

function sanitizeQaInput(text: string, maxLen: number): string {
  let s = text.slice(0, maxLen).replace(/[<>]/g, '');
  for (const kw of INJECTION_KEYWORDS) {
    const re = new RegExp(kw, 'gi');
    s = s.replace(re, '');
  }
  return s.trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripMarkdownFences(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function extractFirstJsonObject(text: string): string | null {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (!ch) continue;

    if (start < 0) {
      if (ch === '{') {
        start = i;
        depth = 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') {
      depth += 1;
      continue;
    }
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

function normalizeTags(value: unknown): string[] {
  const rawTags = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return Array.from(
    new Set(
      rawTags
        .filter((tag): tag is string => typeof tag === 'string')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 5);
}

function coerceGeneratedArticlePayload(rawContent: string): GeneratedArticlePayload {
  const cleaned = stripMarkdownFences(rawContent);
  const candidates = [cleaned];
  const extractedJson = extractFirstJsonObject(cleaned);
  if (extractedJson && extractedJson !== cleaned) {
    candidates.push(extractedJson);
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate) as Partial<GeneratedArticlePayload>;
      if (typeof parsed.title === 'string' && typeof parsed.body === 'string') {
        return {
          title: parsed.title.trim().slice(0, 160) || 'AI generated article',
          body: parsed.body.trim(),
          tags: normalizeTags(parsed.tags),
          categoryId: typeof parsed.categoryId === 'string' ? parsed.categoryId : undefined,
        };
      }
    } catch {
      // Try the next parsing strategy.
    }
  }

  const fallbackText = cleaned.trim();
  if (!fallbackText) {
    throw new Error('AI returned an empty response');
  }

  const firstLine =
    fallbackText
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean) ?? 'AI generated article';

  const normalizedBody = fallbackText.includes('<')
    ? fallbackText
    : `<p>${escapeHtml(fallbackText)
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, '<br />')}</p>`;

  return {
    title: firstLine.replace(/^#+\s*/, '').slice(0, 160) || 'AI generated article',
    body: normalizedBody,
    tags: [],
  };
}

function buildSystemPrompt(
  categoryName: string | null,
  serviceName: string | null,
  categories: Array<{ id: string; name: string }> = [],
): string {
  const specialisation = serviceName
    ? `${serviceName}${categoryName ? ` (${categoryName})` : ''}`
    : categoryName ?? 'finance or legal practice';

  return [
    `You are a senior Indian finance or legal practitioner — a Chartered Accountant, tax advisor, or lawyer — writing a thought-leadership article in your area of practice for fellow practitioners.`,
    ``,
    `The article will appear on a curated professional network. Your audience is other qualified practitioners, not the general public. Assume technical fluency: do not define basic terms (GST, TDS, Section 7, ITC, TP, etc.) — explain only genuinely nuanced concepts.`,
    ``,
    `DOMAIN: You specialise in ${specialisation}. Typical topics you might cover:`,
    `- Recent rulings of the Supreme Court, High Courts, ITAT, CESTAT, NCLT, NCLAT, AAR`,
    `- Notifications, circulars, and amendments from CBDT, CBIC, MCA, SEBI, RBI`,
    `- Statutory interpretation of specific sections (e.g. Section 16 of CGST, Section 56(2)(x) of IT Act)`,
    `- Litigation strategy, transfer pricing, international tax, IBC outcomes, compliance`,
    `- Practical impact on taxpayers and clients`,
    ``,
    `QUALITY BAR — non-negotiable:`,
    `- This must NOT read like a generic overview article. Avoid "at 40,000 feet" commentary. Every paragraph must say something a practitioner couldn't have written on the flight home from memory.`,
    `- Every factual claim needs a specific anchor: a section number, a notification number and date, a case citation with parties/court/year, or a rate/threshold with the exact figure. Vague references ("recent ruling", "a circular was issued") are a failure.`,
    `- No throat-clearing. No "in today's rapidly evolving regulatory landscape". No "it is important to note that". Open with substance.`,
    `- If the topic is thin, say less. A sharp 800 words beats a padded 1,100.`,
    ``,
    `RESEARCH — USE WEB SEARCH ACTIVELY:`,
    `- You have web search available. USE IT. Do not rely only on your training data — it is stale for recent rulings and notifications.`,
    `- For every case you cite, search to confirm the citation (parties, court, year) and that the holding is stated correctly.`,
    `- For every notification, circular, section, or rule you reference, search to verify the number and its current status (post-amendment, withdrawn, superseded).`,
    `- Prefer rulings and notifications from the last 3 years when the topic allows.`,
    `- If a concept has recent developments (a fresh ruling, amendment, or circular), search and incorporate them.`,
    `- Never fabricate case names, citations, notification numbers, or section numbers. If unsure, search first, and if still unsure, omit rather than invent.`,
    `- Where you cite a ruling, include the citation inline (e.g. "CIT v. X Ltd. (2024) 123 ITR 456 (SC)"). Where you cite a notification/circular, include its number and date.`,
    ``,
    `ARTICLE STRUCTURE — follow this exactly:`,
    `1. One introductory <p> (2-3 sentences) that opens with a concrete hook — a specific ruling, amendment, or problem practitioners are actually grappling with. Not a generic premise.`,
    `2. Three to four sections. Each section MUST follow this pattern:`,
    `   <h2>Specific, descriptive section heading</h2>`,
    `   <p>Context, facts, or statutory position...</p>`,
    `   <p>Analysis, implications, or practitioner view...</p>`,
    `   (optionally: <blockquote><p>…judicial quote…</p></blockquote> or <ul><li>…</li></ul>)`,
    `3. One closing <p> with a clear takeaway or practical recommendation.`,
    `Target length: 800 to 1,100 words.`,
    ``,
    `TABLES — use them. They are expected whenever the content admits a structured comparison:`,
    `- USE A TABLE when the article: compares pre- vs post-amendment positions; contrasts old vs new rates, slabs, thresholds, or penalties; summarises how different courts or benches ruled on the same issue; presents an applicability matrix (e.g. "which assessees / which transactions / which sections"); lays out a timeline of events; or summarises facts across multiple cases.`,
    `- Most articles in this domain warrant AT LEAST ONE table. If your article discusses comparisons, amendments, rates, or multiple rulings, a table is not optional — include it.`,
    `- Emit full markup: <table><thead><tr><th>Heading</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>. Keep cells concise — short phrases, not sentences.`,
    ``,
    `FORMATTING RULES — strict:`,
    `- Use only these HTML tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <a>, <blockquote>, <table>, <thead>, <tbody>, <tr>, <th>, <td>`,
    `- Do NOT use em dashes (—) anywhere. Use a comma, a colon, or restructure the sentence.`,
    `- Do NOT use curly/smart quotes. Use straight double quotes " or the HTML entities &ldquo; and &rdquo;.`,
    `- Wrap judicial quotes in <blockquote><p>...</p></blockquote>.`,
    `- Use <strong> for key statutory references or principles, never for whole sentences.`,
    `- Use <h3> only for sub-headings inside a section, never standalone after an <h2>.`,
    `- Every <h2> or <h3> must be immediately followed by a <p>.`,
    `- Do NOT use <br>, <hr>, <div>, <span>, or any other tags.`,
    `- Do NOT include the title inside the body — the title is a separate JSON field.`,
    ``,
    `TONE: analytical and practitioner-focused. You are a practising professional with an opinion grounded in law, not a copywriter or academic. Be direct about the "so what" for the practitioner.`,
    ...(categories.length > 0 ? [
      ``,
      `CATEGORY — pick the single most relevant category for this article and include its id as "categoryId":`,
      ...categories.map((c) => `- ${c.name} → "${c.id}"`),
    ] : []),
    ``,
    `OUTPUT FORMAT — critical:`,
    `Return ONLY a valid JSON object. No markdown, no code fences, no commentary outside the JSON.`,
    `The JSON must have these keys:`,
    `- "title": string — specific and substantive, max 80 characters. The title must name the actual issue (section, ruling, rate change) — not a generic topic.`,
    `- "body": string — the full article HTML following all rules above, with inline citations where relevant`,
    `- "tags": string[] — up to 5 lowercase keywords (e.g. ["gst", "section 16", "itc", "cestat"])`,
    ...(categories.length > 0 ? [`- "categoryId": string — the id from the CATEGORY list above`] : []),
  ].join('\n');
}

function getAiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

async function fetchUnsplashImage(query: string, accessKey: string): Promise<string | null> {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&content_filter=high`;
    const resp = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });
    if (!resp.ok) return null;
    const data = await resp.json() as { results?: Array<{ urls?: { regular?: string } }> };
    const results = data.results ?? [];
    if (results.length === 0) return null;
    const idx = Math.floor(Math.random() * Math.min(results.length, 5));
    return results[idx]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

function resolveAiModel(provider: string, config: ConfigService): AiModel | null {
  const modelOverride = config.get<string>('AI_MODEL');
  switch (provider) {
    case 'openrouter': {
      const key = config.get<string>('OPENROUTER_API_KEY');
      if (!key) return null;
      const model = modelOverride ?? config.get<string>('OPENROUTER_MODEL') ?? 'google/gemini-2.0-flash-lite-001';
      return createOpenAI({ apiKey: key, baseURL: 'https://openrouter.ai/api/v1' })(model);
    }
    case 'openai': {
      const key = config.get<string>('OPENAI_API_KEY');
      if (!key) return null;
      return createOpenAI({ apiKey: key })(modelOverride ?? 'gpt-4o-mini');
    }
    case 'anthropic': {
      const key = config.get<string>('ANTHROPIC_API_KEY');
      if (!key) return null;
      return createAnthropic({ apiKey: key })(modelOverride ?? 'claude-haiku-4-5-20251001');
    }
    case 'google':
    case 'gemini':
    default: {
      const key =
        config.get<string>('GOOGLE_AI_API_KEY') ??
        config.get<string>('GOOGLE_GENERATIVE_AI_API_KEY');
      if (!key) return null;
      return createGoogleGenerativeAI({ apiKey: key })(modelOverride ?? 'gemini-2.0-flash');
    }
  }
}

// NEVER select the embedding column

// Flat fields (member portal, admin — no join needed)
const ARTICLE_FLAT_FIELDS =
  'id, title, subtitle, slug, excerpt, featured_image_url, tags, read_time_minutes, published_at, ' +
  'status, category_id, service_id, creation_mode, submitted_at, ai_summary, ' +
  'rejection_reason, author_id, created_at, updated_at';

const ARTICLE_FLAT_FULL_FIELDS = ARTICLE_FLAT_FIELDS + ', body';

// Public select — includes author profile + service category joins for listing/detail pages
const ARTICLE_PUBLIC_SELECT =
  ARTICLE_FLAT_FIELDS + ', ' +
  'author:members!author_id(id, slug, designation, headline, city, country, member_tier, profile_photo_url, ' +
  'user:users!user_id(first_name, last_name), ' +
  'primary_service:services!primary_service_id(name)), ' +
  'category:categories!category_id(id, name)';

const ARTICLE_PUBLIC_FULL_SELECT = ARTICLE_PUBLIC_SELECT + ', body';

type ArticleRow = {
  id: string;
  author_id: string;
  status: string;
  body?: string;
  featured_image_url?: string | null;
  slug: string;
  [key: string]: unknown;
};

function sanitizeBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'blockquote', 'br',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https'],
  });
}

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);
  private readonly aiQueue: Queue | null;
  private readonly aiModel: AiModel | null;
  private readonly aiProvider: string;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly cache: CacheService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
    private readonly embeddingService: EmbeddingService,
  ) {
    this.aiQueue = isQueueDisabled(config)
      ? null
      : new Queue(QUEUE_NAMES.AI, { connection: getQueueConnection(config) });

    this.aiProvider = config.get<string>('AI_PROVIDER') ?? 'gemini';
    this.aiModel = resolveAiModel(this.aiProvider, config);
  }

  get isAiConfigured(): boolean {
    return this.aiModel !== null;
  }

  // ─── List Articles ────────────────────────────────────────────────────────

  async getList(
    dto: QueryArticlesDto,
  ): Promise<{ data: unknown[]; meta: PaginationMeta }> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, 50);
    const offset = (page - 1) * limit;

    // Build cache key for public published list
    const cacheKey = !dto.memberId
      ? this.cache.buildKey(
        'articles',
        'list',
        `p${page}l${limit}${dto.categoryId ?? ''}${dto.serviceId ?? ''}${dto.serviceIds ?? ''}${dto.q ?? ''}${dto.sort ?? ''}${dto.minReadTime ?? ''}${dto.maxReadTime ?? ''}${dto.tag ?? ''}`,
      )
      : null;

    if (cacheKey) {
      const cached = await this.cache.get<{ data: unknown[]; meta: PaginationMeta }>(cacheKey);
      if (cached) return cached;
    }

    let query = this.supabase.adminClient
      .from('articles')
      .select(ARTICLE_PUBLIC_SELECT, { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (dto.memberId) {
      // Viewing a specific member's published articles (e.g. profile page)
      query = query.eq('status', 'published').eq('author_id', dto.memberId);
    } else {
      // Public listing — everyone sees all published articles.
      // Members manage their own drafts via GET /articles/member/me, not here.
      query = query.eq('status', 'published');
    }

    if (dto.categoryId) {
      query = query.eq('category_id', dto.categoryId);
    }
    if (dto.serviceIds) {
      const ids = dto.serviceIds.split(',').map((id) => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        query = query.in('service_id', ids);
      }
    } else if (dto.serviceId) {
      query = query.eq('service_id', dto.serviceId);
    }
    if (dto.memberId) {
      query = query.eq('author_id', dto.memberId);
    }
    if (dto.q) {
      query = query.or(`title.ilike.%${dto.q}%,excerpt.ilike.%${dto.q}%`);
    }
    if (dto.minReadTime !== undefined) {
      query = query.gte('read_time_minutes', dto.minReadTime);
    }
    if (dto.maxReadTime !== undefined) {
      query = query.lte('read_time_minutes', dto.maxReadTime);
    }
    if (dto.tag) {
      query = query.contains('tags', [dto.tag.toLowerCase()]);
    }

    switch (dto.sort) {
      case 'oldest':
        query = query.order('published_at', { ascending: true });
        break;
      case 'read_time_asc':
        query = query
          .order('read_time_minutes', { ascending: true })
          .order('published_at', { ascending: false });
        break;
      case 'read_time_desc':
        query = query
          .order('read_time_minutes', { ascending: false })
          .order('published_at', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('published_at', { ascending: false });
        break;
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
    const authorId =
      user.role === 'ops' || user.role === 'backend_admin'
        ? EDITORIAL_MEMBER_ID
        : user.memberId;
    if (!authorId) return [];

    const { data, error } = await this.supabase.adminClient
      .from('articles')
      .select(ARTICLE_FLAT_FIELDS)
      .eq('author_id', authorId)
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
          .select(ARTICLE_PUBLIC_FULL_SELECT)
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
    let query = this.supabase.adminClient
      .from('articles')
      .select(ARTICLE_FLAT_FULL_FIELDS)
      .eq('id', id);

    // Members can only fetch their own; ops / backend_admin can fetch any.
    if (user.role !== 'ops' && user.role !== 'backend_admin') {
      if (!user.memberId) throw new ForbiddenException('Member access required');
      query = query.eq('author_id', user.memberId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException(`Article '${id}' not found`);
    return data;
  }

  // ─── Get Related Articles ────────────────────────────────────────────────

  async getRelated(id: string): Promise<unknown[]> {
    const { data: article } = await this.supabase.adminClient
      .from('articles')
      .select('service_id, category_id')
      .eq('id', id)
      .single();

    if (!article) return [];

    const { service_id, category_id } = article as { service_id?: string; category_id?: string };

    const base = this.supabase.adminClient
      .from('articles')
      .select(ARTICLE_PUBLIC_SELECT)
      .eq('status', 'published')
      .neq('id', id)
      .limit(4);

    // 1st pass: match by service_id
    if (service_id) {
      const { data } = await base.eq('service_id', service_id);
      if (data && data.length > 0) return data;
    }

    // 2nd pass: broaden to category_id
    if (category_id) {
      const { data } = await this.supabase.adminClient
        .from('articles')
        .select(ARTICLE_PUBLIC_SELECT)
        .eq('status', 'published')
        .neq('id', id)
        .eq('category_id', category_id)
        .limit(4);
      if (data && data.length > 0) return data;
    }

    // 3rd pass: fallback to most recent published articles
    const { data: fallback } = await this.supabase.adminClient
      .from('articles')
      .select(ARTICLE_PUBLIC_SELECT)
      .eq('status', 'published')
      .neq('id', id)
      .order('published_at', { ascending: false })
      .limit(4);

    return fallback ?? [];
  }

  // ─── Create Article ───────────────────────────────────────────────────────

  async create(user: AuthUser, dto: CreateArticleDto): Promise<unknown> {
    try {
      const authorId = await this.resolveAuthorMemberId(user);

      const sanitizedBody = sanitizeBody(dto.body);
      const readTime = calculateReadTime(sanitizedBody);
      const excerpt = extractExcerpt(sanitizedBody);

      // Generate unique slug. Fall back to a random id if the title slugifies
      // to empty (all non-ASCII, just punctuation, etc.).
      let slug = slugify(dto.title || '');
      if (!slug) slug = `draft-${randomSuffix(8)}`;
      const exists = await this.slugExists(slug);
      if (exists) {
        slug = `${slug}-${randomSuffix(6)}`;
      }

      this.logger.log(
        `Creating article: title="${dto.title?.slice(0, 60)}" authorId=${authorId} ` +
        `slug=${slug} bodyLen=${sanitizedBody.length} tags=${(dto.tags ?? []).length}`,
      );

      const { data, error } = await this.supabase.adminClient
        .from('articles')
        .insert({
          author_id: authorId,
          title: dto.title,
          slug,
          body: sanitizedBody,
          excerpt,
          featured_image_url: dto.featuredImageUrl ?? null,
          tags: (dto.tags ?? []).map((t) => t.toLowerCase()),
          category_id: dto.categoryId ?? null,
          service_id: dto.serviceId ?? null,
          read_time_minutes: readTime,
          status: 'draft',
          creation_mode: 'manual',
        })
        .select(ARTICLE_FLAT_FULL_FIELDS)
        .single();

      if (error) {
        this.logger.error(
          `Article insert failed: ${error.message} (code=${error.code})`,
          JSON.stringify(error),
        );
        throw error;
      }
      return data;
    } catch (err) {
      this.logger.error(
        `create() threw: ${(err as Error).message}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw err;
    }
  }

  // ─── Update Article ───────────────────────────────────────────────────────

  async update(user: AuthUser, id: string, dto: UpdateArticleDto): Promise<unknown> {
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
      payload.read_time_minutes = calculateReadTime(sanitized);
      payload.excerpt = extractExcerpt(sanitized);
    }

    if (dto.categoryId !== undefined) payload.category_id = dto.categoryId;
    if (dto.serviceId !== undefined) payload.service_id = dto.serviceId;
    if (dto.tags !== undefined) payload.tags = dto.tags.map((t) => t.toLowerCase());
    if (dto.featuredImageUrl !== undefined) {
      payload.featured_image_url = dto.featuredImageUrl;
    }

    const { data, error } = await this.supabase.adminClient
      .from('articles')
      .update(payload)
      .eq('id', id)
      .select(ARTICLE_FLAT_FULL_FIELDS)
      .single();

    if (error) throw error;

    // Invalidate cache
    await this.invalidateArticleCache(existing.slug);

    return data;
  }

  // ─── Delete Article ───────────────────────────────────────────────────────

  async delete(user: AuthUser, id: string): Promise<{ message: string }> {
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
    const existing = await this.getOwnedArticle(user, id);

    // Validate word count from body
    const wordCount = existing.body ? countWords(existing.body) : 0;
    if (wordCount < 300) {
      throw new BadRequestException('Article must be at least 300 words');
    }
    if (wordCount > 5000) {
      throw new BadRequestException('Article must not exceed 5000 words');
    }

    // Validate featured image
    if (!existing.featured_image_url) {
      throw new BadRequestException('Article must have a featured image');
    }

    // Validate max articles in review (scoped to the article's author).
    const { count } = await this.supabase.adminClient
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', existing.author_id)
      .in('status', ['submitted', 'under_review']);

    if ((count ?? 0) >= 2) {
      throw new ConflictException('MAX_ARTICLES_IN_REVIEW');
    }

    const { data, error } = await this.supabase.adminClient
      .from('articles')
      .update({ status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('id', id)
      .select(ARTICLE_FLAT_FULL_FIELDS)
      .single();

    if (error) throw error;

    // Send K8 to ops
    const article = data as unknown as ArticleRow;
    const { data: memberData } = await this.supabase.adminClient
      .from('members')
      .select('users!user_id(first_name, last_name)')
      .eq('id', existing.author_id)
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
    const embedding = await this.embeddingService.embed(dto.query);
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
      .select(ARTICLE_PUBLIC_SELECT)
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
      .select(ARTICLE_FLAT_FULL_FIELDS)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundException(`Article '${id}' not found`);

    const article = data as unknown as ArticleRow;
    if (!this.canEditArticle(user, article)) {
      throw new ForbiddenException('Access denied');
    }

    return article;
  }

  // ops / backend_admin can edit any article; members only their own.
  private canEditArticle(user: AuthUser, article: { author_id: string }): boolean {
    if (user.role === 'ops' || user.role === 'backend_admin') return true;
    return article.author_id === user.memberId;
  }

  // Returns the member id to use as article.author_id for this user.
  // Members write under their own profile; ops / backend_admin write under the
  // seeded "Expertly Editorial" member. If the editorial row isn't present
  // (migration 008 hasn't been applied), it's created lazily.
  private async resolveAuthorMemberId(user: AuthUser): Promise<string> {
    if (user.role === 'ops' || user.role === 'backend_admin') {
      await this.ensureEditorialMember();
      return EDITORIAL_MEMBER_ID;
    }
    if (!user.memberId) {
      throw new ForbiddenException('Member access required');
    }
    return user.memberId;
  }

  // Cached once per process — after the first successful check or create,
  // we don't hit the DB again.
  private editorialMemberEnsured = false;

  private async ensureEditorialMember(): Promise<void> {
    if (this.editorialMemberEnsured) return;
    const sb = this.supabase.adminClient;
    const EDITORIAL_EMAIL = 'editorial@expertly.internal';

    // Fast path — member row already exists.
    const { data: existing } = await sb
      .from('members')
      .select('id')
      .eq('id', EDITORIAL_MEMBER_ID)
      .maybeSingle();
    if (existing) {
      this.editorialMemberEnsured = true;
      return;
    }

    this.logger.warn('Editorial member missing — seeding it now.');

    // Find or create a real Supabase auth user. public.users.supabase_uid
    // has a FK to auth.users(id), so we must go through the admin API.
    let authUserId: string | undefined;

    try {
      // listUsers is paged; most tenants won't page past the first batch.
      const { data: authList } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
      authUserId = authList?.users?.find((u) => u.email === EDITORIAL_EMAIL)?.id;
    } catch (err) {
      this.logger.warn(`listUsers failed while seeding editorial: ${(err as Error).message}`);
    }

    if (!authUserId) {
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: created, error: createErr } = await sb.auth.admin.createUser({
        email: EDITORIAL_EMAIL,
        password: randomPassword,
        email_confirm: true,
        user_metadata: { system: true, role: 'editorial' },
      });
      if (createErr || !created?.user?.id) {
        this.logger.error(`Editorial auth user create failed: ${createErr?.message}`);
        throw createErr ?? new Error('Failed to create editorial auth user');
      }
      authUserId = created.user.id;
    }

    // Upsert public.users row keyed by email.
    const { error: userErr } = await sb.from('users').upsert({
      supabase_uid: authUserId,
      email: EDITORIAL_EMAIL,
      first_name: 'Expertly',
      last_name: 'Editorial',
      role: 'member',
      is_active: true,
    }, { onConflict: 'email' });
    if (userErr) {
      this.logger.error(`Editorial public.users upsert failed: ${userErr.message}`);
      throw userErr;
    }

    // Look up the generated public.users.id to use as member.user_id.
    const { data: userRow, error: userLookupErr } = await sb
      .from('users')
      .select('id')
      .eq('email', EDITORIAL_EMAIL)
      .single();
    if (userLookupErr || !userRow) {
      this.logger.error(`Editorial user lookup failed: ${userLookupErr?.message}`);
      throw userLookupErr ?? new Error('Editorial user not found after upsert');
    }

    const { error: memberErr } = await sb.from('members').upsert({
      id: EDITORIAL_MEMBER_ID,
      user_id: (userRow as { id: string }).id,
      slug: 'expertly-editorial',
      designation: 'Editorial Team',
      headline: 'Analysis and commentary from the Expertly editorial team.',
      bio: 'Articles authored by the Expertly editorial team, covering developments in finance, tax, and legal practice.',
      membership_status: 'active',
      member_tier: 'seasoned_professional',
      is_verified: true,
      is_featured: false,
    }, { onConflict: 'id' });
    if (memberErr) {
      this.logger.error(`Editorial member upsert failed: ${memberErr.message}`);
      throw memberErr;
    }

    // Notification prefs off so K9/K10/etc. never email the dead inbox.
    await sb.from('member_notification_preferences').upsert({
      member_id: EDITORIAL_MEMBER_ID,
      email_on_consultation: false,
      email_on_article_comment: false,
      email_on_event_rsvp: false,
      article_status: false,
      platform_updates: false,
    }, { onConflict: 'member_id' });

    this.editorialMemberEnsured = true;
    this.logger.log(`Editorial member seeded (auth uid=${authUserId})`);
  }

  private async invalidateArticleCache(slug: string): Promise<void> {
    await Promise.all([
      this.cache.del(this.cache.buildKey('articles', 'detail', slug)),
      this.cache.delByPattern(this.cache.buildKey('articles', 'list', '*')),
    ]);
  }

  // ── Ops ───────────────────────────────────────────────────────────────────

  async listOpsArticles(query: { status?: string; page?: number; limit?: number }) {
    const sb = this.supabase.adminClient;
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20);
    const offset = (page - 1) * limit;

    let q = sb
      .from('articles')
      .select(
        'id, title, slug, excerpt, status, author_id, category_id, tags, ' +
        'creation_mode, submitted_at, published_at, rejection_reason, created_at',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.status) q = q.eq('status', query.status);

    const { data, count, error } = await q;
    if (error) throw new BadRequestException(error.message);

    return {
      data: data ?? [],
      meta: { total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) },
    };
  }

  async getOpsArticle(id: string) {
    const { data, error } = await this.supabase.adminClient
      .from('articles')
      .select(
        'id, title, slug, body, excerpt, status, author_id, category_id, tags, ' +
        'creation_mode, submitted_at, published_at, rejection_reason, created_at, updated_at, ' +
        'author:members!author_id(designation, user:users!user_id(first_name, last_name, email))',
      )
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Article not found');

    const { author, ...a } = data as unknown as {
      author: { designation?: string; user: { first_name?: string; last_name?: string; email?: string } | null } | null;
      [key: string]: unknown;
    };

    return {
      ...a,
      author_name: author?.user
        ? `${author.user.first_name ?? ''} ${author.user.last_name ?? ''}`.trim()
        : null,
      author_email: author?.user?.email ?? null,
      author_designation: author?.designation ?? null,
    };
  }

  async approveArticle(id: string) {
    const sb = this.supabase.adminClient;

    const { data: article } = await sb
      .from('articles')
      .select('id, title, slug, body, author_id, status')
      .eq('id', id)
      .single();

    if (!article) throw new NotFoundException('Article not found');
    const a = article as unknown as { id: string; title: string; slug: string; body: string | null; author_id: string; status: string };

    if (!['submitted', 'under_review'].includes(a.status)) {
      throw new BadRequestException('Only submitted or under_review articles can be approved');
    }

    const newBody = (a.body ?? '') + LEGAL_DISCLAIMER_HTML;

    let aiSummary: string | null = null;
    const anthropicKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (anthropicKey) {
      try {
        const plainText = (a.body ?? '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&[a-z]+;/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 3000);
        const { text } = await generateText({
          model: createAnthropic({ apiKey: anthropicKey })('claude-haiku-4-5-20251001'),
          prompt: `Write a 2-3 sentence summary of this article. Be concise and factual. Do not start with "This article" or "The article".\n\n${plainText}`,
        });
        aiSummary = text.trim();
      } catch (err) {
        this.logger.warn(`AI summary generation failed: ${(err as Error).message}`);
      }
    }

    await sb
      .from('articles')
      .update({
        status: 'published',
        body: newBody,
        published_at: new Date().toISOString(),
        ...(aiSummary ? { ai_summary: aiSummary } : {}),
      })
      .eq('id', id);

    const { data: member } = await sb
      .from('members')
      .select('first_name, last_name, user_id')
      .eq('id', a.author_id)
      .single();
    const m = member as unknown as { first_name?: string; last_name?: string; user_id: string } | null;

    const { data: user } = await sb.from('users').select('email').eq('id', m?.user_id ?? '').single();
    const u = user as unknown as { email: string } | null;

    const { data: notifPref } = await sb
      .from('member_notification_preferences')
      .select('article_status')
      .eq('member_id', a.author_id)
      .maybeSingle() as { data: { article_status: boolean } | null };

    const articleStatusEnabled = notifPref?.article_status ?? true;
    if (articleStatusEnabled && u?.email) {
      await this.email.sendK9ArticleApproved({
        to: u.email,
        authorName: `${m?.first_name ?? ''} ${m?.last_name ?? ''}`.trim(),
        articleTitle: a.title,
        articleSlug: a.slug,
      });
    }

    await this.aiQueue?.add(
      QUEUE_JOB_TYPES.GENERATE_EMBEDDING,
      { entityType: 'article', entityId: id },
      { priority: 1 },
    );

    try {
      await this.supabase.revalidatePath(`/articles/${a.slug}`);
    } catch (err) {
      this.logger.warn(`ISR revalidation failed: ${(err as Error).message}`);
    }

    await this.cache.delByPattern('expertly:articles:*');
    await this.cache.delByPattern('expertly:homepage:*');
    return { message: 'Article approved and published' };
  }

  async rejectArticle(id: string, body: { reason?: string; rejectionReason?: string }) {
    const sb = this.supabase.adminClient;

    const { data: article } = await sb
      .from('articles')
      .select('id, title, author_id, status')
      .eq('id', id)
      .single();

    if (!article) throw new NotFoundException('Article not found');
    const a = article as unknown as { id: string; title: string; author_id: string; status: string };

    const reason = body.reason ?? body.rejectionReason ?? '';

    await sb.from('articles').update({ status: 'draft', rejection_reason: reason }).eq('id', id);

    const { data: member } = await sb
      .from('members')
      .select('first_name, last_name, user_id')
      .eq('id', a.author_id)
      .single();
    const m = member as unknown as { first_name?: string; last_name?: string; user_id: string } | null;

    const { data: user } = await sb.from('users').select('email').eq('id', m?.user_id ?? '').single();
    const u = user as unknown as { email: string } | null;

    const { data: notifPref } = await sb
      .from('member_notification_preferences')
      .select('article_status')
      .eq('member_id', a.author_id)
      .maybeSingle() as { data: { article_status: boolean } | null };

    const articleStatusEnabled = notifPref?.article_status ?? true;
    if (articleStatusEnabled && u?.email) {
      await this.email.sendK10ArticleRejected({
        to: u.email,
        authorName: `${m?.first_name ?? ''} ${m?.last_name ?? ''}`.trim(),
        articleTitle: a.title,
        rejectionReason: reason,
      });
    }

    return { message: 'Article rejected and returned to draft' };
  }

  async archiveArticle(id: string, body: { reason?: string }) {
    const sb = this.supabase.adminClient;

    const { data: article } = await sb
      .from('articles')
      .select('id, title, author_id')
      .eq('id', id)
      .single();

    if (!article) throw new NotFoundException('Article not found');
    const a = article as unknown as { id: string; title: string; author_id: string };

    await sb.from('articles').update({ status: 'archived', archived_at: new Date().toISOString() }).eq('id', id);

    const { data: member } = await sb
      .from('members')
      .select('first_name, last_name, user_id')
      .eq('id', a.author_id)
      .single();
    const m = member as unknown as { first_name?: string; last_name?: string; user_id: string } | null;

    const { data: user } = await sb.from('users').select('email').eq('id', m?.user_id ?? '').single();
    const u = user as unknown as { email: string } | null;

    await this.email.sendK21ArticleArchived({
      to: u?.email ?? '',
      authorName: `${m?.first_name ?? ''} ${m?.last_name ?? ''}`.trim(),
      articleTitle: a.title,
      reason: body.reason ?? 'Content policy review',
    });

    await this.cache.delByPattern('expertly:articles:*');
    return { message: 'Article archived' };
  }

  // ── AI Generation ────────────────────────────────────────────────────────

  async generateArticleStream(
    dto: GenerateArticleDto,
    onToken: (token: string) => void,
  ): Promise<GeneratedArticlePayload> {
    if (!this.aiModel) {
      throw new ServiceUnavailableException('AI generation not configured');
    }

    const [{ categoryName, serviceName }, allCategories] = await Promise.all([
      this.resolveContextLabel(dto.categoryId, dto.serviceId)
        .catch(() => ({ categoryName: null, serviceName: null })),
      !dto.categoryId
        ? Promise.resolve(
            this.supabase.adminClient
              .from('categories')
              .select('id, name')
              .eq('is_active', true)
              .order('sort_order', { ascending: true }),
          )
            .then(({ data }) => (data ?? []) as Array<{ id: string; name: string }>)
            .catch(() => [] as Array<{ id: string; name: string }>)
        : Promise.resolve([] as Array<{ id: string; name: string }>),
    ]);

    const systemPrompt = buildSystemPrompt(categoryName, serviceName, allCategories);

    const sanitizedQa = dto.qa.map((item) => ({
      question: sanitizeQaInput(item.question, 500),
      answer: sanitizeQaInput(item.answer, 500),
    }));

    const qaXml = sanitizedQa
      .map(
        (item) =>
          `<user_qa>\n  <question>${item.question}</question>\n  <answer>${item.answer}</answer>\n</user_qa>`,
      )
      .join('\n');

    // Pre-flight relevance check: if any attachment looks unrelated to the
    // topic, reject the generation before spending tokens on the main call.
    if ((dto.attachments?.length ?? 0) > 0) {
      const qaContext = sanitizedQa
        .map((q) => `${q.question}\n${q.answer}`.trim())
        .filter(Boolean)
        .join('\n\n');
      const decisions = await this.checkAttachmentsRelevance(
        qaContext || '(no topic provided)',
        dto.attachments!,
      );
      const irrelevant = decisions.filter((d) => !d.relevant);
      if (irrelevant.length > 0) {
        const details = irrelevant
          .map((d) => `"${d.filename}" — ${d.reason || 'not related to the topic'}`)
          .join('; ');
        throw new BadRequestException(
          `These uploads don't match your topic and were not used: ${details}. ` +
          `Remove them (or replace with a relevant file) and try again.`,
        );
      }
    }

    // Split attachments: text gets folded into the prompt; images go through
    // the AI SDK's multi-modal message content (native vision).
    const textAttachments = (dto.attachments ?? []).filter((a) => a.type === 'text');
    const imageAttachments = (dto.attachments ?? []).filter((a) => a.type === 'image');

    const documentsBlock = textAttachments.length > 0
      ? '\n\n' + textAttachments
          .map(
            (a) =>
              `<source_document filename="${a.filename}">\n${a.content}\n</source_document>`,
          )
          .join('\n\n')
      : '';

    const userContent = qaXml + documentsBlock;

    this.logger.log(
      `Starting AI article generation with ${dto.qa.length} Q&A items, ` +
      `${textAttachments.length} text attachments, ${imageAttachments.length} images ` +
      `(provider=${this.aiProvider})`,
    );

    // Enable provider-native web search so the model can research rulings,
    // notifications, and recent developments while drafting.
    const searchOptions: Record<string, unknown> = {};
    if (this.aiProvider === 'google' || this.aiProvider === 'gemini') {
      searchOptions.providerOptions = { google: { useSearchGrounding: true } };
    } else if (this.aiProvider === 'anthropic') {
      searchOptions.tools = {
        web_search: anthropic.tools.webSearch_20250305({ maxUses: 5 }),
      };
    }

    // If images are attached, use multi-modal messages; otherwise plain prompt.
    // The AI SDK rejects data: URLs for image content, so we strip the data-URL
    // prefix and pass pure base64 + mediaType separately.
    const streamInput = imageAttachments.length > 0
      ? {
          messages: [{
            role: 'user' as const,
            content: [
              { type: 'text' as const, text: userContent },
              ...imageAttachments.map((img) => {
                const match = img.content.match(/^data:([^;]+);base64,(.+)$/);
                const mediaType = match?.[1] ?? 'image/png';
                const base64 = match?.[2] ?? img.content;
                return {
                  type: 'image' as const,
                  image: Buffer.from(base64, 'base64'),
                  mediaType,
                };
              }),
            ],
          }],
        }
      : { prompt: userContent };

    const result = streamText({
      model: this.aiModel,
      system: systemPrompt,
      ...streamInput,
      ...searchOptions,
    });

    let fullContent = '';
    for await (const chunk of result.fullStream) {
      if (chunk.type === 'error') {
        throw new Error(getAiErrorMessage(chunk.error, 'AI stream error'));
      }
      if (chunk.type === 'text-delta' && chunk.text) {
        fullContent += chunk.text;
        onToken(chunk.text);
      }
    }

    const parsed = coerceGeneratedArticlePayload(fullContent);

    if (!parsed.categoryId && dto.categoryId) {
      parsed.categoryId = dto.categoryId;
    }

    const unsplashKey = this.config.get<string>('UNSPLASH_ACCESS_KEY');
    if (unsplashKey && unsplashKey !== 'your_unsplash_access_key_here') {
      const imageQuery = [...parsed.tags, parsed.title].slice(0, 3).join(' ');
      parsed.featuredImageUrl = (await fetchUnsplashImage(imageQuery, unsplashKey)) ?? undefined;
    }

    return parsed;
  }

  // Pre-flight: use the AI to decide whether each attachment is relevant to
  // the article the author is about to draft. Returns per-file decisions.
  // Fails open (treats everything as relevant) if the check itself throws —
  // we don't want a flaky classifier to block legitimate generations.
  private async checkAttachmentsRelevance(
    qaContext: string,
    attachments: Array<{ type: 'text' | 'image'; content: string; filename: string }>,
  ): Promise<Array<{ filename: string; relevant: boolean; reason: string }>> {
    if (!this.aiModel || attachments.length === 0) {
      return attachments.map((a) => ({ filename: a.filename, relevant: true, reason: '' }));
    }

    const intro =
      `You are validating whether uploaded attachments are relevant to an article the author is about to draft. ` +
      `Be liberal — accept anything that could plausibly provide useful context, citations, data, or illustrations for the topic, even if tangential. ` +
      `Reject ONLY attachments that are clearly unrelated (e.g. personal selfies, memes, photos of pets, unrelated news articles, random documents).\n\n` +
      `AUTHOR'S INTENDED ARTICLE CONTEXT:\n${qaContext}\n\n` +
      `FILES TO EVALUATE:`;

    const closing =
      `\n\nReturn ONLY a JSON object in this exact shape, no prose, no code fences:\n` +
      `{"decisions":[{"filename":"<exact filename>","relevant":true|false,"reason":"<one short sentence>"}]}`;

    type Part =
      | { type: 'text'; text: string }
      | { type: 'image'; image: Buffer; mediaType: string };

    const parts: Part[] = [{ type: 'text', text: intro }];

    attachments.forEach((att, i) => {
      if (att.type === 'text') {
        const preview = att.content.slice(0, 2000);
        parts.push({
          type: 'text',
          text: `\n[File ${i + 1}] ${att.filename}\nContent excerpt:\n${preview}`,
        });
      } else {
        const match = att.content.match(/^data:([^;]+);base64,(.+)$/);
        const mediaType = match?.[1] ?? 'image/png';
        const base64 = match?.[2] ?? att.content;
        parts.push({ type: 'text', text: `\n[File ${i + 1}] ${att.filename} (image, shown below):` });
        parts.push({ type: 'image', image: Buffer.from(base64, 'base64'), mediaType });
      }
    });

    parts.push({ type: 'text', text: closing });

    try {
      const { text } = await generateText({
        model: this.aiModel,
        messages: [{ role: 'user', content: parts }],
      });
      const cleaned = stripMarkdownFences(text);
      const jsonText = extractFirstJsonObject(cleaned) ?? cleaned;
      const parsed = JSON.parse(jsonText) as {
        decisions?: Array<{ filename: string; relevant: boolean; reason: string }>;
      };

      if (!Array.isArray(parsed.decisions)) {
        throw new Error('Classifier returned invalid JSON');
      }

      return attachments.map((att, i) => {
        const byName = parsed.decisions?.find((d) => d.filename === att.filename);
        const byIndex = parsed.decisions?.[i];
        const decision = byName ?? byIndex;
        return decision
          ? { filename: att.filename, relevant: !!decision.relevant, reason: decision.reason ?? '' }
          : { filename: att.filename, relevant: true, reason: '' };
      });
    } catch (err) {
      this.logger.warn(
        `Attachment relevance check failed: ${(err as Error).message}. Allowing all.`,
      );
      return attachments.map((a) => ({ filename: a.filename, relevant: true, reason: '' }));
    }
  }

  // Ephemeral extraction — reads the buffer, returns text or base64 image data
  // for inclusion in a subsequent /generate call. Nothing is stored.
  async extractAttachment(
    buffer: Buffer,
    mimeType: string,
    filename: string,
  ): Promise<{ type: 'text' | 'image'; content: string; filename: string }> {
    const MAX_BYTES = 5 * 1024 * 1024;
    if (buffer.length > MAX_BYTES) {
      throw new BadRequestException('File exceeds 5 MB limit');
    }

    // Images go through the model's native vision — no OCR.
    if (mimeType.startsWith('image/')) {
      const base64 = buffer.toString('base64');
      return {
        type: 'image',
        content: `data:${mimeType};base64,${base64}`,
        filename,
      };
    }

    // Text extraction per document type.
    let text = '';
    if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
      const { PDFParse } = await import('pdf-parse');
      // pdf-parse v2 wants a Uint8Array; Buffer is a subclass but TS prefers the cast.
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const { text: pdfText } = await parser.getText();
        text = pdfText ?? '';
      } finally {
        await parser.destroy();
      }
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      filename.toLowerCase().endsWith('.docx')
    ) {
      const mammoth = await import('mammoth');
      const { value } = await mammoth.extractRawText({ buffer });
      text = value;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel' ||
      filename.toLowerCase().endsWith('.xlsx') ||
      filename.toLowerCase().endsWith('.xls')
    ) {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(buffer, { type: 'buffer' });
      text = wb.SheetNames
        .map((name) => `# ${name}\n${XLSX.utils.sheet_to_csv(wb.Sheets[name])}`)
        .join('\n\n');
    } else if (
      mimeType.startsWith('text/') ||
      filename.toLowerCase().match(/\.(txt|md|csv|json)$/)
    ) {
      text = buffer.toString('utf-8');
    } else {
      throw new BadRequestException(
        `Unsupported file type "${mimeType || 'unknown'}" for "${filename}". ` +
        `Accepted: PDF, DOCX, XLSX, TXT, MD, CSV, or any image.`,
      );
    }

    // Cap extracted text to keep the context window manageable.
    const MAX_CHARS = 50000;
    const trimmed = text.trim();
    const capped = trimmed.length > MAX_CHARS
      ? trimmed.slice(0, MAX_CHARS) + '\n\n[… document truncated at 50,000 characters …]'
      : trimmed;

    if (!capped) {
      throw new BadRequestException(`No text could be extracted from "${filename}"`);
    }

    return { type: 'text', content: capped, filename };
  }

  private async resolveContextLabel(
    categoryId?: string,
    serviceId?: string,
  ): Promise<{ categoryName: string | null; serviceName: string | null }> {
    let categoryName: string | null = null;
    let serviceName: string | null = null;

    if (serviceId) {
      const { data } = await this.supabase.adminClient
        .from('services')
        .select('name, categories(name)')
        .eq('id', serviceId)
        .single();
      if (data) {
        const row = data as { name: string; categories?: { name?: string } | null };
        serviceName = row.name ?? null;
        categoryName = row.categories?.name ?? null;
      }
    } else if (categoryId) {
      const { data } = await this.supabase.adminClient
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();
      if (data) {
        categoryName = (data as { name: string }).name ?? null;
      }
    }

    return { categoryName, serviceName };
  }
}
