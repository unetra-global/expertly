/**
 * Test Suite: Notification Preferences
 *
 * Covers PATCH /api/v1/members/me/notifications
 *
 * Scenarios:
 *  N-01  Updates article_status, regulatory_nudges, platform_updates
 *  N-02  Partial update — only one field provided, others unchanged
 *  N-03  Removed fields (consultation_requests, membership_reminders) are stripped by whitelist
 *  N-04  Returns 403 when JWT guard blocks
 *  N-05  Returns 403 for user role (non-member — RolesGuard denies)
 *  N-06  String boolean values ('yes') are rejected as type error
 *  N-07  Empty body succeeds and upserts with only member_id
 *  N-08  Idempotent — two identical calls produce identical DB operations
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

// ── Supabase mock builder ─────────────────────────────────────────────────────

function buildSupabaseMock() {
  const builder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: { article_status: true, regulatory_nudges: true, platform_updates: true },
      error: null,
    }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  };

  return {
    adminClient: {
      from: jest.fn().mockReturnValue(builder),
    },
    _builder: builder,
  };
}

// ── App builder ───────────────────────────────────────────────────────────────

async function buildApp(
  user: typeof MEMBER_USER | typeof PLAIN_USER,
  blockRoles = false,
  blockJwt = false,
): Promise<{ app: INestApplication; supabase: ReturnType<typeof buildSupabaseMock> }> {
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
        if (blockJwt) return false;
        ctx.switchToHttp().getRequest().user = user;
        return true;
      },
    })
    .overrideGuard(RolesGuard)
    .useValue({
      canActivate: (ctx: ExecutionContext) => {
        if (blockRoles) return false;
        const req = ctx.switchToHttp().getRequest() as { user?: { role: string } };
        const required = Reflect.getMetadata('roles', ctx.getHandler()) as string[] | undefined;
        if (!required || required.length === 0) return true;
        return req.user?.role === required[0];
      },
    })
    .compile();

  const app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }),
  );
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return { app, supabase };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Notification Preferences — PATCH /members/me/notifications', () => {
  let app: INestApplication;

  afterEach(async () => { await app?.close(); });

  it('N-01: updates article_status, regulatory_nudges, platform_updates', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    const res = await request(app.getHttpServer())
      .patch('/members/me/notifications')
      .send({ article_status: false, regulatory_nudges: true, platform_updates: false });

    expect(res.status).toBe(200);
    expect(supabase.adminClient.from).toHaveBeenCalledWith('member_notification_preferences');
    expect(supabase._builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        member_id: MEMBER_USER.memberId,
        article_status: false,
        regulatory_nudges: true,
        platform_updates: false,
      }),
      { onConflict: 'member_id' },
    );
  });

  it('N-02: partial update — only supplied fields sent to DB', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    await request(app.getHttpServer())
      .patch('/members/me/notifications')
      .send({ article_status: false });

    const [callArg] = supabase._builder.upsert.mock.calls[0] as [Record<string, unknown>];
    expect(Object.keys(callArg)).not.toContain('regulatory_nudges');
    expect(Object.keys(callArg)).not.toContain('platform_updates');
  });

  it('N-03: consultation_requests and membership_reminders are stripped (whitelist)', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    await request(app.getHttpServer())
      .patch('/members/me/notifications')
      .send({
        article_status: true,
        consultation_requests: false, // removed field
        membership_reminders: false,  // removed field
      });

    const [callArg] = supabase._builder.upsert.mock.calls[0] as [Record<string, unknown>];
    expect(Object.keys(callArg)).not.toContain('consultation_requests');
    expect(Object.keys(callArg)).not.toContain('membership_reminders');
  });

  it('N-04: returns 403 when JWT guard denies', async () => {
    const { app: a } = await buildApp(MEMBER_USER, false, true);
    app = a;

    const res = await request(app.getHttpServer())
      .patch('/members/me/notifications')
      .send({ article_status: false });

    expect(res.status).toBe(403);
  });

  it('N-05: returns 403 for user role (non-member)', async () => {
    const { app: a } = await buildApp(PLAIN_USER);
    app = a;

    const res = await request(app.getHttpServer())
      .patch('/members/me/notifications')
      .send({ article_status: false });

    expect(res.status).toBe(403);
  });

  it('N-06: string boolean values are rejected (type validation)', async () => {
    const { app: a } = await buildApp(MEMBER_USER);
    app = a;

    const res = await request(app.getHttpServer())
      .patch('/members/me/notifications')
      .send({ article_status: 'yes' });

    expect(res.status).toBe(400);
  });

  it('N-07: empty body succeeds and upserts with only member_id', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    const res = await request(app.getHttpServer())
      .patch('/members/me/notifications')
      .send({});

    expect(res.status).toBe(200);
    const [callArg] = supabase._builder.upsert.mock.calls[0] as [Record<string, unknown>];
    expect(Object.keys(callArg)).toEqual(['member_id']);
  });

  it('N-08: two identical calls produce same DB operations (idempotent)', async () => {
    const { app: a, supabase } = await buildApp(MEMBER_USER);
    app = a;

    await request(app.getHttpServer()).patch('/members/me/notifications').send({ article_status: true });
    await request(app.getHttpServer()).patch('/members/me/notifications').send({ article_status: true });

    expect(supabase._builder.upsert).toHaveBeenCalledTimes(2);
    const calls = supabase._builder.upsert.mock.calls as Array<[Record<string, unknown>]>;
    expect(calls[0][0]).toEqual(calls[1][0]);
  });
});
