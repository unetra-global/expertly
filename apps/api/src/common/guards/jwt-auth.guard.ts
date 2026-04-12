import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
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

/** Short-lived in-process cache to avoid hitting Supabase Auth API on every request. */
interface CachedAuthUser {
  user: AuthUser;
  /** Unix ms timestamp after which this entry is stale. */
  expiresAt: number;
}

const AUTH_CACHE_TTL_MS = 30_000; // 30 seconds
const AUTH_CACHE_MAX_SIZE = 2_000; // cap entries to bound memory

/** Module-level map so the cache is shared across all guard instances. */
const authCache = new Map<string, CachedAuthUser>();

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

    // --- Cache hit: skip Supabase Auth API call ---
    const cached = authCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      request.user = cached.user;
      return true;
    }

    const { data: { user: supabaseUser }, error } =
      await this.supabase.adminClient.auth.getUser(token);

    if (error || !supabaseUser) {
      authCache.delete(token); // ensure stale entry is evicted on failure
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Fetch DB user row
    let { data: dbUser, error: userErr } = await this.supabase.adminClient
      .from('users')
      .select('id, role, is_active, is_deleted')
      .eq('supabase_uid', supabaseUser.id)
      .single();

    if (userErr || !dbUser) {
      // Auto-create user row on first login (after OAuth signup)
      const meta = supabaseUser.user_metadata as Record<string, string> | undefined;
      const firstName = meta?.['given_name'] ?? meta?.['first_name'] ?? '';
      const lastName = meta?.['family_name'] ?? meta?.['last_name'] ?? '';

      const { data: newUser, error: insertErr } = await this.supabase.adminClient
        .from('users')
        .insert({
          supabase_uid: supabaseUser.id,
          email: supabaseUser.email ?? '',
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
      userErr = null;
    }

    const userRow = dbUser as UserRow;

    if (!userRow.is_active || userRow.is_deleted) {
      throw new UnauthorizedException('Account is inactive or deleted');
    }

    const authUser: AuthUser = {
      id: supabaseUser.id,
      dbId: userRow.id,
      email: supabaseUser.email ?? '',
      role: userRow.role,
    };

    // If member, fetch member record
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

        // Suspended members get downgraded to user role
        if (memberRow.membership_status === 'suspended') {
          authUser.role = 'user';
        }
      }
    }

    request.user = authUser;

    // --- Populate cache ---
    if (authCache.size >= AUTH_CACHE_MAX_SIZE) {
      // Evict the oldest entry when the cap is reached
      const firstKey = authCache.keys().next().value as string;
      authCache.delete(firstKey);
    }
    authCache.set(token, { user: authUser, expiresAt: Date.now() + AUTH_CACHE_TTL_MS });

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
