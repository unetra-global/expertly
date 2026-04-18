import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SupabaseService } from '../services/supabase.service';
import { AuthUser, UserRole, MembershipStatus } from '@expertly/types';

interface UserRow {
  id: string;
  role: UserRole;
  is_active: boolean;
  is_deleted: boolean;
}

interface MemberRow {
  id: string;
  membership_status: MembershipStatus;
}

interface CachedAuthUser {
  user: AuthUser;
  expiresAt: number;
}

// 60 s TTL — well within the Supabase access-token lifetime (default 1 h).
// Cache is keyed on the raw JWT so a rotated token always gets a fresh lookup.
const AUTH_CACHE_TTL_MS = 60_000;
const AUTH_CACHE_MAX_SIZE = 2_000;
const authCache = new Map<string, CachedAuthUser>();

// JWKS client — fetches Supabase's public keys once and caches them for 10 min.
// Works with any algorithm (ECC P-256 / ES256, RSA, HS256 via legacy secret).
// No SUPABASE_JWT_SECRET env var needed — verification uses the public key set.
let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS(): ReturnType<typeof createRemoteJWKSet> {
  if (!_jwks) {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) throw new Error('SUPABASE_URL is not set');
    _jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
      { cacheMaxAge: 600_000 }, // 10-minute cache — keys change rarely
    );
  }
  return _jwks;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  protected readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly supabase: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest & { user: AuthUser }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    // Cache hit — skip all DB work
    const cached = authCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      request.user = cached.user;
      return true;
    }

    // Verify JWT against Supabase's JWKS endpoint.
    // jose caches the public keys for 10 min — this is NOT a per-request
    // network call. Works automatically with ECC (P-256 / ES256) and any
    // future key rotations without changing this code or env vars.
    let supabaseUid: string;
    let email: string;
    let firstName: string;
    let lastName: string;
    try {
      const { payload } = await jwtVerify(token, getJWKS(), {
        audience: 'authenticated',
      });
      supabaseUid = payload.sub as string;
      if (!supabaseUid) throw new Error('Missing sub claim');

      email = (payload['email'] as string | undefined) ?? '';
      const meta = (payload['user_metadata'] as Record<string, string> | undefined) ?? {};
      firstName = meta['given_name'] ?? meta['first_name'] ?? '';
      lastName = meta['family_name'] ?? meta['last_name'] ?? '';
    } catch {
      authCache.delete(token);
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Fetch DB user row
    let { data: dbUser, error: userErr } = await this.supabase.adminClient
      .from('users')
      .select('id, role, is_active, is_deleted')
      .eq('supabase_uid', supabaseUid)
      .single();

    if (userErr || !dbUser) {
      // Auto-create user row on first login using claims from the JWT payload.
      const { data: newUser, error: insertErr } = await this.supabase.adminClient
        .from('users')
        .insert({
          supabase_uid: supabaseUid,
          email,
          first_name: firstName,
          last_name: lastName,
          role: 'user',
          is_active: true,
          is_deleted: false,
        })
        .select('id, role, is_active, is_deleted')
        .single();

      if (insertErr || !newUser) {
        this.logger.error('Failed to auto-create user record', insertErr?.message);
        throw new UnauthorizedException('User record not found');
      }

      dbUser = newUser;
    }

    const userRow = dbUser as UserRow;

    if (!userRow.is_active || userRow.is_deleted) {
      throw new UnauthorizedException('Account is inactive or deleted');
    }

    const authUser: AuthUser = {
      id: supabaseUid,
      dbId: userRow.id,
      email,
      role: userRow.role,
    };

    // If member, fetch member record to get memberId and membershipStatus
    if (userRow.role === 'member') {
      const { data: memberData } = await this.supabase.adminClient
        .from('members')
        .select('id, membership_status')
        .eq('user_id', userRow.id)
        .single();

      if (memberData) {
        const memberRow = memberData as MemberRow;
        authUser.memberId = memberRow.id;
        authUser.membershipStatus = memberRow.membership_status;

        if (memberRow.membership_status === 'suspended') {
          authUser.role = 'user';
        }
      }
    }

    // Populate cache — evict oldest entry if at capacity
    if (authCache.size >= AUTH_CACHE_MAX_SIZE) {
      authCache.delete(authCache.keys().next().value as string);
    }
    authCache.set(token, { user: authUser, expiresAt: Date.now() + AUTH_CACHE_TTL_MS });

    request.user = authUser;
    return true;
  }

  protected extractToken(request: FastifyRequest): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    const cookies = (request as FastifyRequest & { cookies?: Record<string, string> }).cookies;
    if (cookies?.['sb-access-token']) {
      return cookies['sb-access-token'];
    }

    return null;
  }
}
