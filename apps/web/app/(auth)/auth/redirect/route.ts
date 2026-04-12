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
 * Post-email-login redirect handler.
 * Mirrors the role/application routing in /auth/callback but skips
 * the OAuth code exchange (session is already established).
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

  // Post-auth destination passed by AuthClient as ?next= in the push URL.
  // Only honoured for new users; existing members/ops always go to their route.
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

  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(_name: string, _value: string, _options: CookieOptions) {
          // Read-only in route handlers after cookies() is called
        },
        remove(_name: string, _options: CookieOptions) {
          // Read-only in route handlers after cookies() is called
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${appOrigin}/auth`);
  }

  // ── Fetch user record (role + is_active + is_deleted) ────────────────────
  const { data: dbUser } = await supabase
    .from('users')
    .select('role, is_active, is_deleted')
    .eq('supabase_uid', user.id)
    .maybeSingle();

  // ── Account inactive or deleted ───────────────────────────────────────────
  if (dbUser && (!dbUser.is_active || dbUser.is_deleted)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${appOrigin}/auth?error=account_suspended`);
  }

  const role: string = dbUser?.role ?? 'user';

  // ── Ops roles ─────────────────────────────────────────────────────────────
  if (role === 'backend_admin' || role === 'ops') {
    return NextResponse.redirect(`${appOrigin}/ops`);
  }

  // ── Member ────────────────────────────────────────────────────────────────
  if (role === 'member') {
    return NextResponse.redirect(`${appOrigin}/member/dashboard`);
  }

  // ── Regular user — check application status ───────────────────────────────
  const { data: application } = await supabase
    .from('applications')
    .select('id, status, current_step, re_application_eligible_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!application) {
    // Default to /onboarding — users with no application are here to apply.
    // safeNext is only respected when it points somewhere specific (e.g. a
    // member profile they were trying to view before being asked to sign in).
    return NextResponse.redirect(`${appOrigin}${safeNext ?? '/onboarding'}`);
  }

  const status = application.status as ApplicationStatus;

  if (status === 'draft') {
    return NextResponse.redirect(`${appOrigin}/application`);
  }

  if (['submitted', 'under_review', 'approved', 'waitlisted'].includes(status)) {
    return NextResponse.redirect(`${appOrigin}/application/status`);
  }

  if (status === 'rejected') {
    const eligibleAt = application.re_application_eligible_at as string | null;
    const canReApply = eligibleAt ? new Date(eligibleAt) <= new Date() : true;
    return NextResponse.redirect(
      canReApply
        ? `${appOrigin}/application/status?canReApply=true`
        : `${appOrigin}/application/status`,
    );
  }

  return NextResponse.redirect(`${appOrigin}${safeNext ?? '/onboarding'}`);
}
