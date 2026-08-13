import {
  BadRequestException,
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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
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

@Controller('articles')
export class ArticlesController {
  private readonly logger = new Logger(ArticlesController.name);

  constructor(private readonly articles: ArticlesService) {}

  // CRITICAL: static routes FIRST, parameterized routes LAST

  // 1. POST /articles/search/ai (OptionalJWT)
  @Post('search/ai')
  @UseGuards(OptionalJwtGuard, RolesGuard)
  aiSearch(@Body() dto: ArticleAiSearchDto): Promise<unknown[]> {
    return this.articles.aiSearch(dto);
  }

  // POST /articles/generate/extract — upload a file, get back extracted
  // text (PDF/DOCX/XLSX/TXT/CSV/MD) or a base64 data URL (any image).
  // Ephemeral — nothing is stored.
  @Post('generate/extract')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member', 'ops', 'backend_admin')
  async extractAttachment(@Req() req: FastifyRequest) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data');
    }
    const data = await req.file();
    if (!data) throw new BadRequestException('No file uploaded');

    const file = data as unknown as {
      filename: string;
      mimetype: string;
      toBuffer: () => Promise<Buffer>;
    };
    const buffer = await file.toBuffer();
    return this.articles.extractAttachment(buffer, file.mimetype, file.filename);
  }

  // 2. POST /articles/generate (JWT + Member) — SSE
  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member', 'ops', 'backend_admin')
  async generate(
    @Body() dto: GenerateArticleDto,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (!this.articles.isAiConfigured) {
      await reply.status(503).send({ message: 'AI generation not configured' });
      return;
    }

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

    const sendEvent = (data: string): void => {
      reply.raw.write(`data: ${data}\n\n`);
    };

    try {
      const parsed = await this.articles.generateArticleStream(dto, (token) =>
        sendEvent(JSON.stringify({ type: 'token', token })),
      );
      sendEvent(JSON.stringify({ type: 'done', data: parsed }));
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : 'AI generation failed';
      this.logger.error(`AI generation failed: ${message}`, err instanceof Error ? err.stack : undefined);
      sendEvent(JSON.stringify({ type: 'error', message }));
    } finally {
      reply.raw.end();
    }
  }

  // 3. GET /articles/member/me (JWT + Member)
  @Get('member/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member', 'ops', 'backend_admin')
  getMemberArticles(@CurrentUser() user: AuthUser): Promise<unknown[]> {
    return this.articles.getMemberArticles(user);
  }

  // 4. GET /articles (OptionalJWT)
  @Get()
  @UseGuards(OptionalJwtGuard, RolesGuard)
  getList(
    @Query() dto: QueryArticlesDto,
  ): Promise<{ data: unknown[]; meta: unknown }> {
    return this.articles.getList(dto);
  }

  // 5. POST /articles (JWT + Member)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member', 'ops', 'backend_admin')
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateArticleDto,
  ): Promise<unknown> {
    return this.articles.create(user, dto);
  }

  // 6. GET /articles/id/:id (JWT + Member)
  @Get('id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member', 'ops', 'backend_admin')
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

  // ── Ops ───────────────────────────────────────────────────────────────────
  // Static 'admin/*' routes must come before the :slug catch-all below.

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  listOpsArticles(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.articles.listOpsArticles({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  getOpsArticle(@Param('id') id: string) {
    return this.articles.getOpsArticle(id);
  }

  @Post('admin/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  approveArticle(@Param('id') id: string) {
    return this.articles.approveArticle(id);
  }

  @Post('admin/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  rejectArticle(
    @Param('id') id: string,
    @Body() body: { reason?: string; rejectionReason?: string },
  ) {
    return this.articles.rejectArticle(id, body);
  }

  @Post('admin/:id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ops', 'backend_admin')
  archiveArticle(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.articles.archiveArticle(id, body);
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
  @Roles('member', 'ops', 'backend_admin')
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
  @Roles('member', 'ops', 'backend_admin')
  delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.articles.delete(user, id);
  }

  // 11. POST /articles/:id/submit (JWT + Member)
  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member', 'ops', 'backend_admin')
  submit(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<unknown> {
    return this.articles.submit(user, id);
  }
}
