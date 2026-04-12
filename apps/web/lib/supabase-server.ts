import { createServerClient as _createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client for Server Components (read-only cookies).
 * Do NOT use this in Route Handlers — see createCallbackClient instead.
 *
 * Falls back to a stub client at build time when env vars are not set,
 * so that next build does not throw "Invalid URL" during pre-rendering.
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During `next build` the public env vars may not be present.
  // Return a stub that always reports no authenticated user so layouts
  // can redirect/render the logged-out state without crashing.
  if (!supabaseUrl || !supabaseKey) {
    const stub = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: (_table: string) => ({
        select: (_cols: string) => ({
          eq: (_col: string, _val: unknown) => ({
            maybeSingle: async () => ({ data: null, error: null }),
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    };
    return stub as unknown as ReturnType<typeof _createServerClient>;
  }

  const cookieStore = cookies();
  return _createServerClient(supabaseUrl, supabaseKey, {
    auth: {
      // autoRefreshToken: false is the critical guard against the 429 storm.
      //
      // Without it, every server component that sees an expired access token
      // independently fires POST /auth/v1/token?grant_type=refresh_token from
      // Node.js (user_agent: "node", apikey: "anon"), multiplying refresh calls
      // by the number of server components per page render.
      //
      // Middleware is the sole owner of token refresh — it validates with
      // getUser(), refreshes if needed, and writes the fresh tokens to BOTH
      // request.cookies and response.cookies so every downstream server
      // component sees the updated session without touching the network again.
      //
      // persistSession and detectSessionInUrl are intentionally left at their
      // defaults (true/true). persistSession: false was previously added here
      // but it prevents getSession() from loading the session from cookie
      // storage on init, causing all server components to see a null session.
      autoRefreshToken: false,
    },
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      // Server components cannot set cookies — these are no-ops.
      // Token refresh (and cookie mutation) is handled exclusively in middleware.
      set(_name: string, _value: string, _options: CookieOptions) {},
      remove(_name: string, _options: CookieOptions) {},
    },
  });
}
