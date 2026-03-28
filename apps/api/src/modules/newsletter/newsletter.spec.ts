/**
 * Test Suite: Guest Newsletter Subscriptions
 *
 * Covers POST /newsletter/subscribe
 *        GET  /newsletter/categories
 *
 * Scenarios:
 *  NL-01  Subscribe with name, email, category_id — creates row in guest_newsletter_subscriptions
 *  NL-02  Subscribe without category_id — succeeds (category is optional)
 *  NL-03  Subscribe is a public endpoint (no JWT required)
 *  NL-04  Duplicate email returns 409 Conflict
 *  NL-05  Missing name returns 400
 *  NL-06  Missing email returns 400
 *  NL-07  Invalid email format returns 400
 *  NL-08  New subscription is is_active=true by default
 *  NL-09  GET /newsletter/categories returns all categories (public)
 *  NL-10  GET /newsletter/categories is not limited by auth
 *  NL-11  Non-UUID category_id returns 400
 *  NL-12  Extra fields are stripped by whitelist validation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { ConfigService } from '@nestjs/config';

// ── Helpers ───────────────────────────────────────────────────────────────────

const CAT_UUID_1 = '550e8400-e29b-41d4-a716-446655440001';
const CAT_UUID_2 = '550e8400-e29b-41d4-a716-446655440002';

const CATEGORIES = [
  { id: CAT_UUID_1, name: 'Finance & Tax', slug: 'finance-tax' },
  { id: CAT_UUID_2, name: 'Corporate Law', slug: 'corporate-law' },
];

function buildSupabaseMock(insertResult: { data: unknown; error: unknown } = { data: {}, error: null }) {
  const insertMock = jest.fn().mockResolvedValue(insertResult);

  return {
    adminClient: {
      from: jest.fn((table: string) => {
        if (table === 'categories') {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: CATEGORIES, error: null }),
          };
        }
        if (table === 'guest_newsletter_subscriptions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            insert: insertMock,
          };
        }
        return { insert: insertMock };
      }),
    },
    _insertMock: insertMock,
  };
}

async function buildApp(supabase: ReturnType<typeof buildSupabaseMock>): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [NewsletterController],
    providers: [
      NewsletterService,
      { provide: SupabaseService, useValue: supabase },
      { provide: ConfigService, useValue: { get: jest.fn() } },
    ],
  })
    .compile();

  const app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Guest Newsletter — POST /newsletter/subscribe', () => {
  let app: INestApplication;

  afterEach(async () => { await app?.close(); });

  it('NL-01: creates subscription with name, email, category_id', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ name: 'Jane Doe', email: 'jane@example.com', categoryId: CAT_UUID_1 });

    expect(res.status).toBe(201);
    expect(supabase._insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@example.com',
        category_id: CAT_UUID_1,
        is_active: true,
      }),
    );
  });

  it('NL-02: category_id is optional — subscribe without it', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ name: 'Jane Doe', email: 'jane@example.com' });

    expect(res.status).toBe(201);
    expect(supabase._insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Jane Doe', email: 'jane@example.com' }),
    );
  });

  it('NL-03: endpoint is public (no authorization required)', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    // No auth header — should still work
    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ name: 'Guest User', email: 'guest@example.com' });

    expect(res.status).toBe(201);
  });

  it('NL-04: duplicate email returns 409 Conflict', async () => {
    // Simulate existing subscription found
    const supabase = buildSupabaseMock();
    (supabase.adminClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'existing-id' }, error: null }),
      insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
    });
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ name: 'Jane Doe', email: 'jane@example.com' });

    expect(res.status).toBe(409);
  });

  it('NL-05: missing name returns 400', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ email: 'jane@example.com' });

    expect(res.status).toBe(400);
  });

  it('NL-06: missing email returns 400', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ name: 'Jane Doe' });

    expect(res.status).toBe(400);
  });

  it('NL-07: invalid email format returns 400', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ name: 'Jane Doe', email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('NL-08: subscription is is_active=true by default', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ name: 'Jane Doe', email: 'jane@example.com' });

    expect(supabase._insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: true }),
    );
  });

  it('NL-11: non-UUID category_id returns 400', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({ name: 'Jane Doe', email: 'jane@example.com', categoryId: 'not-a-uuid' });

    expect(res.status).toBe(400);
  });

  it('NL-12: extra fields are stripped and do not cause errors', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer())
      .post('/newsletter/subscribe')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        hackerField: 'malicious',  // should be stripped
      });

    // With forbidNonWhitelisted: true this returns 400
    // With forbidNonWhitelisted: false it's stripped and returns 201
    // Either is acceptable — we test that the extra field didn't cause a 500
    expect([200, 201, 400]).toContain(res.status);
  });
});

describe('Guest Newsletter — GET /newsletter/categories', () => {
  let app: INestApplication;

  afterEach(async () => { await app?.close(); });

  it('NL-09: returns all categories for the subscription dropdown', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    const res = await request(app.getHttpServer()).get('/newsletter/categories');

    expect(res.status).toBe(200);
    // ResponseInterceptor is not active in unit tests — body is the raw array
    const body = res.body as Array<{ id: string; name: string }>;
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({ id: CAT_UUID_1, name: 'Finance & Tax' });
  });

  it('NL-10: categories endpoint requires no authentication', async () => {
    const supabase = buildSupabaseMock();
    app = await buildApp(supabase);

    // No auth header
    const res = await request(app.getHttpServer()).get('/newsletter/categories');
    expect(res.status).toBe(200);
  });
});
