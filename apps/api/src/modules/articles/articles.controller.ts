import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@expertly/types';
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

@Controller('articles')
export class ArticlesController {
  private openai: OpenAI | null = null;

  constructor(
    private readonly articles: ArticlesService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
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
    if (!this.openai) {
      await reply.status(503).send({ message: 'AI generation not configured' });
      return;
    }

    // Set SSE headers
    void reply.raw.setHeader('Content-Type', 'text/event-stream');
    void reply.raw.setHeader('Cache-Control', 'no-cache');
    void reply.raw.setHeader('Connection', 'keep-alive');
    void reply.raw.setHeader('X-Accel-Buffering', 'no');

    // Sanitize Q&A inputs
    const sanitizedQa = dto.qa.map((item) => ({
      question: sanitizeQaInput(item.question, 200),
      answer: sanitizeQaInput(item.answer, 500),
    }));

    const qaXml = sanitizedQa
      .map(
        (item) =>
          `<user_qa>\n  <question>${item.question}</question>\n  <answer>${item.answer}</answer>\n</user_qa>`,
      )
      .join('\n');

    const systemPrompt =
      'You are a professional financial and legal content writer. ' +
      'Write a high-quality article based on the professional\'s responses below. ' +
      'The article should be informative, authoritative, and written in first person. ' +
      'Output ONLY valid JSON with keys: title (string), body (HTML string with h2/h3/p/ul tags), ' +
      'tags (array of max 5 lowercase strings). Do not include markdown code fences.';

    const sendEvent = (data: string): void => {
      reply.raw.write(`data: ${data}\n\n`);
    };

    try {
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        stream: true,
        max_tokens: 4000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: qaXml },
        ],
      });

      let fullContent = '';

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content ?? '';
        if (token) {
          fullContent += token;
          sendEvent(JSON.stringify({ type: 'token', token }));
        }
      }

      // Parse and send final done event
      try {
        // Strip any markdown code fences if present
        const cleaned = fullContent
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        const parsed = JSON.parse(cleaned) as {
          title: string;
          body: string;
          tags: string[];
        };
        sendEvent(
          JSON.stringify({
            type: 'done',
            title: parsed.title,
            body: parsed.body,
            tags: parsed.tags,
          }),
        );
      } catch {
        sendEvent(JSON.stringify({ type: 'error', message: 'Failed to parse AI response' }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI generation failed';
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

  // 7. GET /articles/:slug (OptionalJWT)
  @Get(':slug')
  @UseGuards(OptionalJwtGuard, RolesGuard)
  getBySlug(
    @CurrentUser() user: AuthUser | null,
    @Param('slug') slug: string,
  ): Promise<unknown> {
    return this.articles.getBySlug(slug, user);
  }

  // 8. GET /articles/:id/related (OptionalJWT)
  @Get(':id/related')
  @UseGuards(OptionalJwtGuard, RolesGuard)
  getRelated(@Param('id') id: string): Promise<unknown[]> {
    return this.articles.getRelated(id);
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
