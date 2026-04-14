import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton for use in hooks / client-side code
let _browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!_browserClient) {
    _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

    // When a refresh token is invalid/expired the Supabase client retries the
    // POST /token request on every 429 it receives, creating an infinite loop
    // that can generate tens of thousands of auth requests per day from a single
    // browser.  Calling signOut() on TOKEN_REFRESH_FAILED wipes the stale token
    // from cookies/localStorage so autoRefreshToken has nothing left to retry.
    _browserClient.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESH_FAILED') {
        void _browserClient?.auth.signOut();
      }
    });
  }
  return _browserClient;
}
