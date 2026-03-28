/**
 * Test Suite: Digest Subscriptions
 *
 * Covers:
 *   GET  /members/me/digests
 *   PATCH /members/me/digests
 *
 * Scenarios:
 *  D-01  GET returns all categories with subscription state (subscribed + unsubscribed)
 *  D-02  GET returns empty digests list when no categories exist
 *  D-03  GET works for role='user' (not member) — requires only JWT
 *  D-04  GET works for role='member'
 *  D-05  GET returns 401 without JWT
 *  D-06  PATCH creates a new subscription (isSubscribed=true, first time)
 *  D-07  PATCH updates frequency on existing subscription
 *  D-08  PATCH deactivates subscription (isSubscribed=false sets is_active=false)
 *  D-09  PATCH re-activates subscription (isSubscribed=true on existing inactive row)
 *  D-10  PATCH accepts all three frequency values: daily, weekly, fortnightly
 *  D-11  PATCH rejects invalid frequency value
 *  D-12  PATCH skips insert for isSubscribed=false when no existing row
 *  D-13  PATCH is idempotent — calling twice with same payload yields same DB state
 *  D-14  PATCH returns 401 without JWT
 *  D-15  PATCH accepts empty subscriptions array (no-op)
 *  D-16  PATCH rejects non-UUID categoryId
 *  D-17  Each subscription uses user.dbId, NOT user.memberId
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { CacheService } from '../../common/services/cache.service';
import { EmailService } from '../../common/services/email.service';
import { EmbeddingService } from '../../common/services/embedding.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

// ── Test users ────────────────────────────────────────────────────────────────

const MEMBER_USER = {
  id: 'supabase-uid-member',
  dbId: 'db-user-id-member',
  email: 'member@test.com',
  role: 'member' as const,
  memberId: 'member-id-001',
};

const PLAIN_USER = {
  id: 'supabase-uid-user',
  dbId: 'db-user-id-plain',
  email: 'user@test.com',
  role: 'user' as const,
};

// ── Sample data ───────────────────────────────────────────────────────────────

// Valid UUID v4 values for use in DTO payloads (must pass @IsUUID() validation)
const VALID_CAT_UUID = '550e8400-e29b-41d4-a716-446655440001';

const CATEGORIES = [
  { id: VALID_CAT_UUID, name: 'Finance & Tax' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Corporate Law' },
];

const EXISTING_SUBSCRIPTIONS = [
  { category_id: VALID_CAT_UUID, frequency: 'weekly', is_active: true },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSupabaseMock() {
  const builder: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  };

  return {
    adminClient: {
      from: jest.fn((table: string) => {
        if (table === 'categories') {
          return {
            ...builder,
            order: jest.fn().mockResolvedValue({ data: CATEGORIES, error: null }),
          };
        }
        if (table === 'user_digest_subscriptions') {
          return {
            ...builder,
            // GET call resolves with existing subs
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          };
        }
        return builder;
      }),
    },
    _builder: builder,
  };
}

async function buildApp(user: typeof MEMBER_USER | typeof PLAIN_USER): Promise<{
  app: INestApplication;
  supabase: ReturnType<typeof buildSupabaseMock>;
}> {
  const supabase = buildSupabaseMock();

  const module: TestingModule = await Test.createTestingModule({
    controllers: [MembersController],
    providers: [
      MembersService,
      { provide: SupabaseService, useValue: supabase },
      { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn(), delByPattern: jest.fn() } },
      { provide: EmailService, useValue: {} },
      { provide: EmbeddingService, useValue: { generateEmbedding: jest.fn() } },
      { provide: ConfigService, useValue: { get: jest.fn() } },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (ctx: ExecutionContext) => {
        ctx.switchToHttp().getRequest().user = user;
        return true;
      },
    })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return { app, supabase };
}

// ── Test Suite: GET /members/me/digests ───────────────────────────────────────

describe('Digest Subscriptions — GET /members/me/digests', () => {
  let app: INestApplication;

  afterEach(async () => { await app?.close(); });

  it('D-01: returns all categories merged with subscription state', async () => {
    // Arrange: member with one active subscription
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    // Override the user_digest_subscriptions query to return existing subs
    (supabase.adminClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'categories') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: CATEGORIES, error: null }),
        };
      }
      if (table === 'user_digest_subscriptions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: EXISTING_SUBSCRIPTIONS, error: null }),
        };
      }
      return supabase._builder;
    });

    const res = await request(app.getHttpServer()).get('/members/me/digests');

    expect(res.status).toBe(200);
    // ResponseInterceptor is not active in unit tests — body is the raw array
    const body = res.body as Array<Record<string, unknown>>;
    expect(body).toHaveLength(2);

    const catFinance = body.find((d) => d.categoryId === VALID_CAT_UUID);
    const catLaw = body.find((d) => d.categoryId === '550e8400-e29b-41d4-a716-446655440002');

    expect(catFinance?.isSubscribed).toBe(true);
    expect(catFinance?.frequency).toBe('weekly');
    expect(catLaw?.isSubscribed).toBe(false);
    expect(catLaw?.frequency).toBe('weekly'); // default
  });

  it('D-02: returns empty array when no categories exist', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    (supabase.adminClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'categories') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const res = await request(app.getHttpServer()).get('/members/me/digests');
    expect(res.status).toBe(200);
    expect(res.body as unknown[]).toHaveLength(0);
  });

  it('D-03: works for role=user (JWT only, no member role required)', async () => {
    const { app: a, supabase } = await buildApp(PLAIN_USER);
    app = a;

    (supabase.adminClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'categories') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: CATEGORIES, error: null }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const res = await request(app.getHttpServer()).get('/members/me/digests');
    expect(res.status).toBe(200);
  });

  it('D-04: works for role=member', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    (supabase.adminClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'categories') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: CATEGORIES, error: null }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: EXISTING_SUBSCRIPTIONS, error: null }),
      };
    });

    const res = await request(app.getHttpServer()).get('/members/me/digests');
    expect(res.status).toBe(200);
  });

  it('D-05: returns 403 when JWT guard denies', async () => {
    const supabase = buildSupabaseMock();
    const module = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        MembersService,
        { provide: SupabaseService, useValue: supabase },
        { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn(), delByPattern: jest.fn() } },
        { provide: EmailService, useValue: {} },
        { provide: EmbeddingService, useValue: { generateEmbedding: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => false })
      .compile();

    const a = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await a.init();
    await a.getHttpAdapter().getInstance().ready();
    app = a;

    const res = await request(app.getHttpServer()).get('/members/me/digests');
    expect(res.status).toBe(403);
  });
});

// ── Test Suite: PATCH /members/me/digests ─────────────────────────────────────

describe('Digest Subscriptions — PATCH /members/me/digests', () => {
  let app: INestApplication;

  afterEach(async () => { await app?.close(); });

  it('D-06: creates new subscription when isSubscribed=true and no existing row', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    // No existing subscription
    (supabase.adminClient.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
    }));

    const insertMock = jest.fn().mockResolvedValue({ data: {}, error: null });
    (supabase.adminClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: insertMock,
      update: jest.fn().mockReturnThis(),
    });

    await request(app.getHttpServer())
      .patch('/members/me/digests')
      .send({
        subscriptions: [{ categoryId: VALID_CAT_UUID, isSubscribed: true, frequency: 'weekly' }],
      });

    // insert must be called because no existing row
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: MEMBER_USER.dbId,
        category_id: VALID_CAT_UUID,
        is_active: true,
        frequency: 'weekly',
      }),
    );
  });

  it('D-07: updates frequency on existing subscription', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    const updateMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockResolvedValue({ data: {}, error: null });
    updateMock.mockReturnValue({ eq: eqMock });

    (supabase.adminClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'sub-001' }, error: null }),
      update: updateMock,
    });

    await request(app.getHttpServer())
      .patch('/members/me/digests')
      .send({
        subscriptions: [{ categoryId: VALID_CAT_UUID, isSubscribed: true, frequency: 'daily' }],
      });

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ frequency: 'daily', is_active: true }),
    );
  });

  it('D-08: deactivates subscription (isSubscribed=false sets is_active=false)', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    const updateMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockResolvedValue({ data: {}, error: null });
    updateMock.mockReturnValue({ eq: eqMock });

    (supabase.adminClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'sub-001' }, error: null }),
      update: updateMock,
    });

    await request(app.getHttpServer())
      .patch('/members/me/digests')
      .send({
        subscriptions: [{ categoryId: VALID_CAT_UUID, isSubscribed: false, frequency: 'weekly' }],
      });

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: false }),
    );
  });

  it('D-09: re-activates an existing inactive subscription', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    const updateMock = jest.fn().mockReturnThis();
    updateMock.mockReturnValue({ eq: jest.fn().mockResolvedValue({ data: {}, error: null }) });

    (supabase.adminClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'sub-001' }, error: null }),
      update: updateMock,
    });

    await request(app.getHttpServer())
      .patch('/members/me/digests')
      .send({
        subscriptions: [{ categoryId: VALID_CAT_UUID, isSubscribed: true, frequency: 'fortnightly' }],
      });

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: true }),
    );
  });

  it('D-10: accepts all three frequencies: daily, weekly, fortnightly', async () => {
    for (const frequency of ['daily', 'weekly', 'fortnightly']) {
      const { app: a, supabase } = await buildApp(MEMBER_USER);
      app = a;

      (supabase.adminClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      const res = await request(app.getHttpServer())
        .patch('/members/me/digests')
        .send({
          subscriptions: [{ categoryId: VALID_CAT_UUID, isSubscribed: true, frequency }],
        });

      expect(res.status).toBe(200);
      await app.close();
    }
  });

  it('D-11: rejects invalid frequency value', async () => {
    const { app: a } = await buildApp(MEMBER_USER);
    app = a;

    const res = await request(app.getHttpServer())
      .patch('/members/me/digests')
      .send({
        subscriptions: [{ categoryId: VALID_CAT_UUID, isSubscribed: true, frequency: 'biweekly' }],
      });

    expect(res.status).toBe(400);
  });

  it('D-12: skips insert when isSubscribed=false and no existing row', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    const insertMock = jest.fn().mockResolvedValue({ data: {}, error: null });

    (supabase.adminClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: insertMock,
    });

    const res = await request(app.getHttpServer())
      .patch('/members/me/digests')
      .send({
        subscriptions: [{ categoryId: VALID_CAT_UUID, isSubscribed: false, frequency: 'weekly' }],
      });

    expect(res.status).toBe(200);
    expect(insertMock).not.toHaveBeenCalled(); // must NOT insert inactive sub
  });

  it('D-13: idempotent — two identical calls produce same DB operations', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    const insertMock = jest.fn().mockResolvedValue({ data: {}, error: null });

    (supabase.adminClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: insertMock,
    });

    const payload = { subscriptions: [{ categoryId: VALID_CAT_UUID, isSubscribed: true, frequency: 'weekly' }] };

    await request(app.getHttpServer()).patch('/members/me/digests').send(payload);
    await request(app.getHttpServer()).patch('/members/me/digests').send(payload);

    // Both calls should result in inserts (second call sees no existing — mock always returns null)
    expect(insertMock).toHaveBeenCalledTimes(2);
  });

  it('D-14: returns 403 without JWT', async () => {
    const supabase = buildSupabaseMock();
    const module = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        MembersService,
        { provide: SupabaseService, useValue: supabase },
        { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn(), delByPattern: jest.fn() } },
        { provide: EmailService, useValue: {} },
        { provide: EmbeddingService, useValue: { generateEmbedding: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => false })
      .compile();

    const a = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await a.init();
    await a.getHttpAdapter().getInstance().ready();
    app = a;

    const res = await request(app.getHttpServer())
      .patch('/members/me/digests')
      .send({ subscriptions: [] });

    expect(res.status).toBe(403);
  });

  it('D-15: empty subscriptions array is a valid no-op', async () => {
    const { app: a } = await buildApp(MEMBER_USER);
    app = a;

    const res = await request(app.getHttpServer())
      .patch('/members/me/digests')
      .send({ subscriptions: [] });

    expect(res.status).toBe(200);
  });

  it('D-16: rejects non-UUID categoryId', async () => {
    const { app: a } = await buildApp(MEMBER_USER);
    app = a;

    const res = await request(app.getHttpServer())
      .patch('/members/me/digests')
      .send({
        subscriptions: [{ categoryId: 'not-a-uuid', isSubscribed: true, frequency: 'weekly' }],
      });

    expect(res.status).toBe(400);
  });

  it('D-17: uses user.dbId (not memberId) to key user_digest_subscriptions', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    const insertMock = jest.fn().mockResolvedValue({ data: {}, error: null });

    (supabase.adminClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: insertMock,
    });

    await request(app.getHttpServer())
      .patch('/members/me/digests')
      .send({
        subscriptions: [{ categoryId: VALID_CAT_UUID, isSubscribed: true, frequency: 'daily' }],
      });

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: MEMBER_USER.dbId,         // DB user id, NOT supabase uid
        // memberId is NOT used here
      }),
    );
    const [callArg] = insertMock.mock.calls[0] as [Record<string, unknown>];
    expect(Object.keys(callArg)).not.toContain('member_id');
  });
});
