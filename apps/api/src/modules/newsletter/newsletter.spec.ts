/**
 * Test Suite: Newsletter Subscriptions (authenticated users only)
 *
 * Covers POST /newsletter/subscribe (requires JWT)
 *        GET  /newsletter/categories (public)
 *
 * Scenarios:
 *  NL-01  Subscribe with valid categoryIds — creates rows in user_digest_subscriptions
 *  NL-02  Subscribe requires authentication — 403 without JWT
 *  NL-03  Duplicate subscription returns 409 Conflict
 *  NL-04  Missing categoryIds returns 400
 *  NL-05  Empty categoryIds array returns 400
 *  NL-06  GET /newsletter/categories returns all categories (public)
 *  NL-07  GET /newsletter/categories is accessible without auth
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmailService } from '../../common/services/email.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// ── Helpers ───────────────────────────────────────────────────────────────────

const CAT_UUID_1 = '550e8400-e29b-41d4-a716-446655440001';
const CAT_UUID_2 = '550e8400-e29b-41d4-a716-446655440002';

const CATEGORIES = [
  { id: CAT_UUID_1, name: 'Finance & Tax', slug: 'finance-tax' },
  { id: CAT_UUID_2, name: 'Corporate Law', slug: 'corporate-law' },
];

const AUTH_USER = {
  id: 'supabase-uid-001',
  dbId: 'db-user-id-001',
  email: 'member@example.com',
  role: 'member' as const,
};

function buildSupabaseMock(existingSubscription: unknown = null) {
  const insertMock = jest.fn().mockResolvedValue({ error: null });

  return {
    adminClient: {
      from: jest.fn((table: string) => {
        if (table === 'categories') {
          return {
            select: jest.fn().mockReturnThis(),
            neq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: CATEGORIES, error: null }),
          };
        }
        if (table === 'user_digest_subscriptions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: existingSubscription, error: null }),
            insert: insertMock,
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }),
    },
    _insertMock: insertMock,
  };
}

async function buildApp(
  supabase: ReturnType<typeof buildSupabaseMock>,
  blockJwt = false,
): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [NewsletterController],
    providers: [
      NewsletterService,
      { provide: SupabaseService, useValue: supabase },
      { provide: EmailService, useValue: { sendK23NewsletterWelcome: jest.fn().mockResolvedValue(undefined) } },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (ctx: ExecutionContext) => {
        if (blockJwt) return false;
        ctx.switchToHttp().getRequest().user = AUTH_USER;
        return true;
      },
    })
    .compile();

  const app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }),
  );
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Newsletter — POST /newsletter/subscribe', () => {
  let app: INestApplication;

  afterEach(async () => { await app?.close(); });

  it('NL-01: subscribes authenticated user to given categoryIds', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ categoryIds: [CAT_UUID_1, CAT_UUID_2] });

    expect(res.status).toBe(201);
    expect(supabase._insertMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ user_id: AUTH_USER.dbId, category_id: CAT_UUID_1, is_active: true }),
        expect.objectContaining({ user_id: AUTH_USER.dbId, category_id: CAT_UUID_2, is_active: true }),
      ]),
    );
  });

  it('NL-02: returns 403 without JWT', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase, true);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ categoryIds: [CAT_UUID_1] });

    expect(res.status).toBe(403);
  });

  it('NL-03: duplicate subscription returns 409 Conflict', async () => {
    const supabase = buildSupabaseMock({ id: 'existing-sub' });
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ categoryIds: [CAT_UUID_1] });

    expect(res.status).toBe(409);
  });

  it('NL-04: missing categoryIds returns 400', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({});

    expect(res.status).toBe(400);
  });

  it('NL-05: empty categoryIds array returns 400', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ categoryIds: [] });

    expect(res.status).toBe(400);
  });
});

describe('Newsletter — GET /newsletter/categories', () => {
  let app: INestApplication;

  afterEach(async () => { await app?.close(); });

  it('NL-06: returns all categories', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer()).get('/newsletter/categories');

    expect(res.status).toBe(200);
    const body = res.body as Array<{ id: string; name: string }>;
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({ id: CAT_UUID_1, name: 'Finance & Tax' });
  });

  it('NL-07: categories are accessible without authentication', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase, true); // JWT blocked

    const res = await request(app.getHttpServer()).get('/newsletter/categories');
    expect(res.status).toBe(200);
  });
});
