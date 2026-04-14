import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton for use in hooks / client-side code
let _browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!_browserClient) {
    _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

    // When a refresh token is invalid the SDK emits SIGNED_OUT and clears the
    // stored session automatically — autoRefreshToken then has nothing left to
    // retry, which stops the 429 storm.  No extra handler needed here.
  }
  return _browserClient;
}
