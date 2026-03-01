import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — used in Client Components and hooks
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton for use in hooks / client-side code
let _browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!_browserClient) {
    _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return _browserClient;
}
