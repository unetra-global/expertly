import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/member', '/ops', '/onboarding', '/application'];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return NextResponse.next();

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    // IMPORTANT: autoRefreshToken: false is required here.
    // The browser SDK already has autoRefreshToken: true (default) and owns
    // the refresh lifecycle. If middleware also refreshes, both racing on the
    // same refresh_token trips Supabase's per-IP rate limit on /auth/v1/token
    // and causes 429 storms (one client's refresh invalidates the other's
    // refresh_token -> "Invalid Refresh Token" -> retry cascade).
    //
    // getUser() below still works with this setting: it just validates the
    // current token without attempting to refresh. If the access token is
    // expired (browser refresh hasn't caught up yet), getUser() returns null,
    // we redirect to /auth once, and the browser refreshes on next load.
    auth: { autoRefreshToken: false },
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  // getUser() authenticates the JWT with Supabase Auth (GET /auth/v1/user).
  // Unlike getSession(), it returns a verified user — so we don't leak
  // protected page shells to anyone with a forged cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth';
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/member/:path*', '/ops/:path*', '/onboarding/:path*', '/onboarding', '/application/:path*', '/application'],
};
