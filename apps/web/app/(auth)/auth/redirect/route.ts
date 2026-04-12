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
 * All redirects use new URL(path, request.url) — the origin is derived from
 * the live request, so this works on localhost, staging, production, and
 * Vercel preview deploys without any NEXT_PUBLIC_APP_URL env var.
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
    return NextResponse.redirect(new URL('/auth', request.url));
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
    return NextResponse.redirect(new URL('/auth?error=account_suspended', request.url));
  }

  const role: string = dbUser?.role ?? 'user';

  // ── Ops roles ─────────────────────────────────────────────────────────────
  if (role === 'backend_admin' || role === 'ops') {
    return NextResponse.redirect(new URL('/ops', request.url));
  }

  // ── Member ────────────────────────────────────────────────────────────────
  if (role === 'member') {
    return NextResponse.redirect(new URL('/member/dashboard', request.url));
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
    return NextResponse.redirect(new URL(safeNext ?? '/', request.url));
  }

  const status = application.status as ApplicationStatus;

  if (status === 'draft') {
    return NextResponse.redirect(new URL('/application', request.url));
  }

  if (['submitted', 'under_review', 'approved', 'waitlisted'].includes(status)) {
    return NextResponse.redirect(new URL('/application/status', request.url));
  }

  if (status === 'rejected') {
    const eligibleAt = application.re_application_eligible_at as string | null;
    const canReApply = eligibleAt ? new Date(eligibleAt) <= new Date() : true;
    return NextResponse.redirect(
      new URL(
        canReApply ? '/application/status?canReApply=true' : '/application/status',
        request.url,
      ),
    );
  }

  return NextResponse.redirect(new URL(safeNext ?? '/', request.url));
}
