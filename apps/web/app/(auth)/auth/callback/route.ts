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
 * Auth callback — handles both OAuth (LinkedIn) and email confirmation flows.
 *
 * Post-auth destination resolution (in priority order):
 *   1. post_auth_redirect cookie — set by AuthClient before the OAuth redirect.
 *      This is the only reliable mechanism for LinkedIn OIDC, which strips
 *      custom query parameters from the redirectTo URL during the OAuth chain.
 *   2. ?next= URL param — fallback for email confirmation links, which may be
 *      opened on a different device where the cookie is absent, but where
 *      Supabase preserves the query parameter we embedded in emailRedirectTo.
 *
 * Redirect origin resolution (in priority order):
 *   1. NEXT_PUBLIC_APP_URL — baked into the bundle at Docker build time.
 *   2. x-forwarded-proto + x-forwarded-host — set by reverse proxies.
 *   3. host header — bare-metal / local dev fallback.
 *
 * We deliberately do NOT use `new URL(path, request.url)` for building
 * redirect destinations because request.url reflects the Docker container's
 * internal address (e.g. http://7d28370d7c3c:4000/…), not the public domain.
 *
 * Routing states:
 *   1  error param or no code            → /
 *   2  session exchange fails             → /?authError=oauth_failed
 *   3  account suspended / deleted        → /auth?error=account_suspended
 *   4  role = backend_admin | ops         → /ops
 *   5  role = member                      → /member/dashboard
 *   6  user + draft application           → /application
 *   7  user + submitted/in-review/etc.    → /application/status
 *   8  user + rejected application        → /application/status[?canReApply=true]
 *   9  new user / no application          → safeNext ?? /
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');

  // ── Derive the public-facing origin ──────────────────────────────────────
  const appOrigin = (
    process.env.NEXT_PUBLIC_APP_URL ??
    `${request.headers.get('x-forwarded-proto') ?? 'https'}://${
      request.headers.get('x-forwarded-host') ??
      request.headers.get('host') ??
      'localhost:4000'
    }`
  ).replace(/\/$/, '');

  // ── State 1: OAuth error or missing code ──────────────────────────────────
  if (oauthError || !code) {
    return NextResponse.redirect(`${appOrigin}/`);
  }

  // ── Resolve post-auth destination ─────────────────────────────────────────
  const cookieStore = cookies();

  // Cookie (primary): set by AuthClient before the OAuth redirect.
  const redirectCookieRaw = cookieStore.get('post_auth_redirect')?.value;
  const fromCookie = redirectCookieRaw
    ? decodeURIComponent(redirectCookieRaw)
    : null;

  // URL param (fallback): embedded in emailRedirectTo for email confirmation,
  // or preserved by OAuth providers that do honour query params.
  const fromParam = searchParams.get('next');

  // Accept whichever source produces a safe relative path first.
  const safeNext = (() => {
    for (const candidate of [fromCookie, fromParam]) {
      if (
        candidate &&
        candidate.startsWith('/') &&
        !candidate.startsWith('//')
      ) {
        return candidate;
      }
    }
    return null;
  })();

  // ── Cookie set collection ─────────────────────────────────────────────────
  // Starts with a cookie-clear entry so the post_auth_redirect cookie is
  // consumed on every successful auth path, regardless of which buildRedirect
  // branch fires.
  const cookiesToSet: Array<{
    name: string;
    value: string;
    options: CookieOptions;
  }> = [];

  if (redirectCookieRaw) {
    cookiesToSet.push({
      name: 'post_auth_redirect',
      value: '',
      options: {
        path: '/',
        maxAge: 0,
        sameSite: 'lax',
      } as CookieOptions,
    });
  }

  // ── Supabase client (writes session cookies into cookiesToSet) ────────────
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

  // ── State 3: Account inactive or deleted ──────────────────────────────────
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
  // Default to /onboarding for users with no application — they signed up
  // to apply for membership. safeNext is only used when it points elsewhere
  // (e.g. a member profile they were trying to view before signing in).
  if (!application) {
    return buildRedirect(`${appOrigin}${safeNext ?? '/onboarding'}`, cookiesToSet);
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
  return buildRedirect(`${appOrigin}${safeNext ?? '/onboarding'}`, cookiesToSet);
}

/** Attach all accumulated cookies to a redirect response. */
function buildRedirect(
  url: string,
  cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>,
): NextResponse {
  const response = NextResponse.redirect(url);
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(
      name,
      value,
      options as Parameters<typeof response.cookies.set>[2],
    );
  }
  return response;
}
