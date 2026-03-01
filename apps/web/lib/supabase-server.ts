import { createServerClient as _createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client for Server Components (read-only cookies).
 * Do NOT use this in Route Handlers — see createCallbackClient instead.
 */
export function createServerClient() {
  const cookieStore = cookies();
  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Server components cannot set cookies — these are no-ops
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
    },
  );
}
