import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (_browserClient) return _browserClient;

  // When the SDK gets a 429 on POST /token (refresh), it normally retries
  // immediately — generating 40+ calls/second and triggering a rate-limit storm.
  // We intercept that specific case and return a 400 refresh_token_not_found
  // response instead, which the SDK treats as fatal: it emits SIGNED_OUT and
  // stops all retries immediately.
  const tokenUrl = `${supabaseUrl}/auth/v1/token`;
  const customFetch: typeof fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input as URL).toString();
    const response = await fetch(input, init);
    if (response.status === 429 && url.startsWith(tokenUrl)) {
      return new Response(
        JSON.stringify({ error: 'refresh_token_not_found', error_description: 'Too many requests — signing out' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    return response;
  };

  _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: customFetch },
  });

  // When the session dies (expired refresh token, sign-out, etc.) redirect to
  // the login page so the user isn't stuck on a protected page with a dead session.
  _browserClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT' && typeof window !== 'undefined') {
      const returnTo = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth?returnTo=${returnTo}`;
    }
  });

  return _browserClient;
}
