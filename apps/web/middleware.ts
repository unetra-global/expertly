import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/member', '/ops', '/onboarding', '/application'];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing (build time), allow through — layouts will guard.
  if (!supabaseUrl || !supabaseKey) return NextResponse.next();

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Write to BOTH request and response cookies.
        //
        // Why both? When @supabase/ssr refreshes an expired access token here
        // in middleware, the new tokens must be visible to every server
        // component (layout, page) that runs in the same render cycle — those
        // components read from the *request* cookies, not the response.
        // Writing only to the response (the old bug) left every downstream
        // server component seeing the stale expired token and each one
        // independently firing its own POST /token?grant_type=refresh_token,
        // producing the 429 storm observed in auth logs (user_agent: node).
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

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
