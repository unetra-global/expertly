import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'waitlisted';

/**
 * Auth callback — 7-state redirect handler.
 *
 * State 1: error param or no code → /
 * State 2: session exchange fails → /?authError=oauth_failed
 * State 3: account suspended → /auth?error=account_suspended
 * State 4: role = backend_admin | ops → /ops
 * State 5: role = member → /member/dashboard
 * State 6: user + draft application → /application
 * State 7: user + submitted/under_review/approved/waitlisted → /application/status
 * State 8: user + rejected application (eligible or not) → /application/status[?canReApply=true]
 * State 9: new user or no application → safeNext ?? /
 *
 * The redirect origin is resolved as follows (in priority order):
 *   1. NEXT_PUBLIC_APP_URL — baked into the bundle at Docker build time; always
 *      equals the public-facing domain in production.
 *   2. x-forwarded-proto + x-forwarded-host headers — set by nginx/Cloudflare/
 *      any reverse proxy; correct when the env var is not present.
 *   3. host header — last resort for bare-metal / local dev without a proxy.
 *
 * We deliberately do NOT use `new URL(path, request.url)` because `request.url`
 * reflects the URL the container received (e.g. http://7d28370d7c3c:4000/…),
 * not the public-facing domain.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');

  // Post-auth destination — encoded in the callback URL by AuthClient so it
  // survives the OAuth round-trip. Only honoured for new users (State 9);
  // existing members/ops/users-with-applications always go to their own route.
  const nextRaw = searchParams.get('next');
  const safeNext =
    nextRaw && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
      ? nextRaw
      : null;

  // ── Derive the public-facing origin ──────────────────────────────────────
  // NEXT_PUBLIC_APP_URL is baked into the bundle at Docker build time.
  // Fallback to forwarded headers (set by reverse proxies) so this also works
  // in local dev and non-Docker environments without the env var.
  const appOrigin = (
    process.env.NEXT_PUBLIC_APP_URL ??
    `${request.headers.get('x-forwarded-proto') ?? 'https'}://${
      request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'localhost:4000'
    }`
  ).replace(/\/$/, '');

  // ── State 1: OAuth error or missing code ──────────────────────────────────
  if (oauthError || !code) {
    return NextResponse.redirect(`${appOrigin}/`);
  }

  // Build a Supabase client that can write session cookies to the response
  const cookieStore = cookies();
  const cookiesToSet: Array<{
    name: string;
    value: string;
    options: CookieOptions;
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookiesToSet.push({ name, value, options });
        },
        remove(name: string, options: CookieOptions) {
          cookiesToSet.push({ name, value: '', options });
        },
      },
    },
  );

  // ── State 2: Code exchange ────────────────────────────────────────────────
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return buildRedirect(`${appOrigin}/?authError=oauth_failed`, cookiesToSet);
  }

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return buildRedirect(`${appOrigin}/`, cookiesToSet);
  }

  // ── Fetch user record (role + is_active + is_deleted) ────────────────────
  const { data: dbUser } = await supabase
    .from('users')
    .select('role, is_active, is_deleted')
    .eq('supabase_uid', user.id)
    .maybeSingle();

  // ── State 3: Account inactive or deleted (only applies if the row exists) ──
  if (dbUser && (!dbUser.is_active || dbUser.is_deleted)) {
    await supabase.auth.signOut();
    return buildRedirect(`${appOrigin}/auth?error=account_suspended`, cookiesToSet);
  }

  const role: string = dbUser?.role ?? 'user';

  // ── State 4: Ops roles ────────────────────────────────────────────────────
  if (role === 'backend_admin' || role === 'ops') {
    return buildRedirect(`${appOrigin}/ops`, cookiesToSet);
  }

  // ── State 5: Member ───────────────────────────────────────────────────────
  if (role === 'member') {
    return buildRedirect(`${appOrigin}/member/dashboard`, cookiesToSet);
  }

  // ── States 6–9: Regular user — check application status ──────────────────
  const { data: application } = await supabase
    .from('applications')
    .select('id, status, current_step, re_application_eligible_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // ── State 9: No application ───────────────────────────────────────────────
  if (!application) {
    return buildRedirect(`${appOrigin}${safeNext ?? '/'}`, cookiesToSet);
  }

  const status = application.status as ApplicationStatus;

  // ── State 6: Draft application ────────────────────────────────────────────
  if (status === 'draft') {
    return buildRedirect(`${appOrigin}/application`, cookiesToSet);
  }

  // ── State 7: Active application ───────────────────────────────────────────
  if (['submitted', 'under_review', 'approved', 'waitlisted'].includes(status)) {
    return buildRedirect(`${appOrigin}/application/status`, cookiesToSet);
  }

  // ── State 8: Rejected application ────────────────────────────────────────
  if (status === 'rejected') {
    const eligibleAt = application.re_application_eligible_at as string | null;
    const canReApply = eligibleAt ? new Date(eligibleAt) <= new Date() : true;
    return buildRedirect(
      canReApply
        ? `${appOrigin}/application/status?canReApply=true`
        : `${appOrigin}/application/status`,
      cookiesToSet,
    );
  }

  // ── State 9: Fallback ─────────────────────────────────────────────────────
  return buildRedirect(`${appOrigin}${safeNext ?? '/'}`, cookiesToSet);
}

/** Build a redirect response and attach any cookies set during auth exchange. */
function buildRedirect(
  url: string,
  cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>,
): NextResponse {
  const response = NextResponse.redirect(url);
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  }
  return response;
}
