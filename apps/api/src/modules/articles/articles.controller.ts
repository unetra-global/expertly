import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@expertly/types';
import { SupabaseService } from '../../common/services/supabase.service';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { ArticleAiSearchDto } from './dto/ai-search.dto';
import { GenerateArticleDto } from './dto/generate-article.dto';

const INJECTION_KEYWORDS = [
  'ignore',
  'forget',
  'disregard',
  'previous instructions',
  'system prompt',
  'you are now',
];

function sanitizeQaInput(text: string, maxLen: number): string {
  let s = text.slice(0, maxLen).replace(/[<>]/g, '');
  for (const kw of INJECTION_KEYWORDS) {
    const re = new RegExp(kw, 'gi');
    s = s.replace(re, '');
  }
  return s.trim();
}

type AiModel = ReturnType<ReturnType<typeof createOpenAI>> | ReturnType<ReturnType<typeof createGoogleGenerativeAI>> | ReturnType<ReturnType<typeof createAnthropic>>;

interface GeneratedArticlePayload {
  title: string;
  body: string;
  tags: string[];
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
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

async function resolveContextLabel(
  supabase: SupabaseService,
  categoryId?: string,
  serviceId?: string,
): Promise<{ categoryName: string | null; serviceName: string | null }> {
  let categoryName: string | null = null;
  let serviceName: string | null = null;

  if (serviceId) {
    const { data } = await supabase.adminClient
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
    const { data } = await supabase.adminClient
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

function buildSystemPrompt(categoryName: string | null, serviceName: string | null): string {
  const specialisation = serviceName
    ? `${serviceName}${categoryName ? ` (${categoryName})` : ''}`
    : categoryName ?? 'financial and legal professional services';

  return [
    `You are a professional content writer specialising in ${specialisation} for qualified practitioners.`,
    `Write a high-quality, thought-leadership article in the first person, as if the professional below is the author sharing real expertise.`,
    ``,
    `ARTICLE STRUCTURE — follow this exactly:`,
    `1. One introductory <p> (2-3 sentences) that opens with a hook — a striking observation, challenge, or question.`,
    `2. Three to four sections. Each section MUST follow this pattern, with no exceptions:`,
    `   <h2>Descriptive section heading</h2>`,
    `   <p>Opening sentence of section...</p>`,
    `   <p>Further content, examples, or explanation...</p>`,
    `   (optionally: <ul><li>...</li></ul> for a short list of points)`,
    `3. One closing <p> with a clear takeaway or call to action.`,
    `Target length: 800 to 1,000 words.`,
    ``,
    `FORMATTING RULES — these are strict:`,
    `- Use only these HTML tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>`,
    `- Do NOT use em dashes (—) anywhere. Replace them with a comma, a colon, or restructure the sentence.`,
    `- Do NOT use curly/smart quotes. Use straight double quotes " or the HTML entities &ldquo; and &rdquo;.`,
    `- When quoting a client, source, or statistic, wrap the quote in <blockquote><p>...</p></blockquote>.`,
    `- Use <strong> for key terms or critical phrases that deserve emphasis — not for entire sentences.`,
    `- Use <h3> only for sub-headings within a section, not as a standalone heading after <h2>.`,
    `- Every <h2> or <h3> must be immediately followed by a <p> — never left hanging.`,
    `- Do NOT use <br>, <hr>, <div>, <span>, or any other tags.`,
    `- Do NOT include a title inside the body — the title is a separate JSON field.`,
    ``,
    `TONE: authoritative, direct, and practical. Write as a practitioner sharing hard-won insight, not as an academic or a copywriter.`,
    ``,
    `OUTPUT FORMAT — critical:`,
    `Return ONLY a valid JSON object. No markdown, no code fences, no explanation outside the JSON.`,
    `The JSON must have exactly these three keys:`,
    `- "title": string — a compelling article title, max 80 characters`,
    `- "body": string — the full article HTML, following all rules above`,
    `- "tags": string[] — up to 5 lowercase keyword strings relevant to the article`,
  ].join('\n');
}

function resolveModel(provider: string, config: ConfigService): { model: AiModel | null } {
  switch (provider) {
    case 'openrouter': {
      const key = config.get<string>('OPENROUTER_API_KEY');
      if (!key) return { model: null };
      const model = config.get<string>('OPENROUTER_MODEL') ?? 'google/gemini-2.0-flash-lite-001';
      return {
        model: createOpenAI({
          apiKey: key,
          baseURL: 'https://openrouter.ai/api/v1',
        })(model),
      };
    }
    case 'openai': {
      const key = config.get<string>('OPENAI_API_KEY');
      if (!key) return { model: null };
      return { model: createOpenAI({ apiKey: key })('gpt-4o-mini') };
    }
    case 'anthropic': {
      const key = config.get<string>('ANTHROPIC_API_KEY');
      if (!key) return { model: null };
      return { model: createAnthropic({ apiKey: key })('claude-haiku-4-5-20251001') };
    }
    case 'gemini':
    default: {
      const key = config.get<string>('GOOGLE_GENERATIVE_AI_API_KEY');
      if (!key) return { model: null };
      return { model: createGoogleGenerativeAI({ apiKey: key })('gemini-2.0-flash') };
    }
  }
}

@Controller('articles')
export class ArticlesController {
  private readonly logger = new Logger(ArticlesController.name);
  private aiModel: AiModel | null = null;

  constructor(
    private readonly articles: ArticlesService,
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {
    const provider = this.config.get<string>('AI_PROVIDER') ?? 'gemini';
    this.aiModel = resolveModel(provider, this.config).model;
  }

  // CRITICAL: static routes FIRST, parameterized routes LAST

  // 1. POST /articles/search/ai (OptionalJWT)
  @Post('search/ai')
  @UseGuards(OptionalJwtGuard, RolesGuard)
  aiSearch(@Body() dto: ArticleAiSearchDto): Promise<unknown[]> {
    return this.articles.aiSearch(dto);
  }

  // 2. POST /articles/generate (JWT + Member) — SSE
  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  async generate(
    @Body() dto: GenerateArticleDto,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (!this.aiModel) {
      await reply.status(503).send({ message: 'AI generation not configured' });
      return;
    }

    // Resolve category/service label for the system prompt before hijacking
    // so any DB errors can still return a proper HTTP error response.
    const { categoryName, serviceName } = await resolveContextLabel(
      this.supabase,
      dto.categoryId,
      dto.serviceId,
    ).catch(() => ({ categoryName: null, serviceName: null }));

    const systemPrompt = buildSystemPrompt(categoryName, serviceName);

    // Hijack the response so Fastify/NestJS interceptors don't try to call
    // reply.send() after we've already ended the stream with reply.raw.end().
    const originHeader = reply.request.headers.origin;
    const corsOrigin = typeof originHeader === 'string' ? originHeader : undefined;

    reply.hijack();
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...(corsOrigin ? { 'Access-Control-Allow-Origin': corsOrigin, 'Access-Control-Allow-Credentials': 'true', 'Vary': 'Origin' } : {}),
    });

    // Sanitize Q&A inputs — slice to 500 chars per spec
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

    const sendEvent = (data: string): void => {
      reply.raw.write(`data: ${data}\n\n`);
    };

    try {
      this.logger.log(`Starting AI article generation with ${dto.qa.length} Q&A items`);
      const result = streamText({
        model: this.aiModel,
        system: systemPrompt,
        prompt: qaXml,
      });

      let fullContent = '';

      for await (const chunk of result.fullStream) {
        if (chunk.type === 'error') {
          throw new Error(getErrorMessage(chunk.error, 'AI stream error'));
        }
        if (chunk.type === 'text-delta' && chunk.text) {
          fullContent += chunk.text;
          sendEvent(JSON.stringify({ type: 'token', token: chunk.text }));
        }
      }

      // Parse and send final done event
      try {
        const parsed = coerceGeneratedArticlePayload(fullContent);
        sendEvent(JSON.stringify({ type: 'done', data: parsed }));
      } catch (parseErr) {
        const message = getErrorMessage(parseErr, 'Failed to parse AI response');
        this.logger.warn(`AI generation parse failed: ${message}`);
        sendEvent(JSON.stringify({ type: 'error', message }));
      }
    } catch (err) {
      const message = getErrorMessage(err, 'AI generation failed');
      this.logger.error(`AI generation failed: ${message}`, err instanceof Error ? err.stack : undefined);
      sendEvent(JSON.stringify({ type: 'error', message }));
    } finally {
      reply.raw.end();
    }
  }

  // 3. GET /articles/member/me (JWT + Member)
  @Get('member/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  getMemberArticles(@CurrentUser() user: AuthUser): Promise<unknown[]> {
    return this.articles.getMemberArticles(user);
  }

  // 4. GET /articles (OptionalJWT)
  @Get()
  @UseGuards(OptionalJwtGuard, RolesGuard)
  getList(
    @CurrentUser() user: AuthUser | null,
    @Query() dto: QueryArticlesDto,
  ): Promise<{ data: unknown[]; meta: unknown }> {
    return this.articles.getList(dto, user);
  }

  // 5. POST /articles (JWT + Member)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateArticleDto,
  ): Promise<unknown> {
    return this.articles.create(user, dto);
  }

  // 6. GET /articles/id/:id (JWT + Member)
  @Get('id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  getById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<unknown> {
    return this.articles.getById(id, user);
  }

  // 7. GET /articles/:id/related (OptionalJWT) — must come BEFORE :slug
  @Get(':id/related')
  @UseGuards(OptionalJwtGuard, RolesGuard)
  getRelated(@Param('id') id: string): Promise<unknown[]> {
    return this.articles.getRelated(id);
  }

  // 8. GET /articles/:slug (OptionalJWT)
  @Get(':slug')
  @UseGuards(OptionalJwtGuard, RolesGuard)
  getBySlug(
    @CurrentUser() user: AuthUser | null,
    @Param('slug') slug: string,
  ): Promise<unknown> {
    return this.articles.getBySlug(slug, user);
  }

  // 9. PATCH /articles/:id (JWT + Member)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<unknown> {
    return this.articles.update(user, id, dto);
  }

  // 10. DELETE /articles/:id (JWT + Member)
  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.articles.delete(user, id);
  }

  // 11. POST /articles/:id/submit (JWT + Member)
  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  submit(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<unknown> {
    return this.articles.submit(user, id);
  }
}
