import { createServerClient } from '@/lib/supabase-server';
import { NavbarClient } from './NavbarClient';

/**
 * Server component: reads the Supabase session to determine auth state,
 * then delegates rendering to NavbarClient (client component).
 */
export default async function Navbar() {
  let userRole: string | null = null;
  let userAvatarUrl: string | undefined;
  let userEmail: string | undefined;

  try {
    const supabase = createServerClient();
    // getSession() reads from cookies — no Supabase network call.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;

    if (user) {
      userEmail = user.email;

      const { data: dbUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('supabase_uid', user.id)
        .maybeSingle();

      userRole = dbUser?.role ?? 'user';

      if (dbUser?.role === 'member' && dbUser?.id) {
        const { data: member } = await supabase
          .from('members')
          .select('profile_photo_url')
          .eq('user_id', dbUser.id)
          .maybeSingle();
        userAvatarUrl = member?.profile_photo_url ?? undefined;
      }
    }
  } catch {
    // Supabase unavailable (e.g. missing env vars at build time) — render logged-out state
  }

  return (
    <NavbarClient
      userRole={userRole}
      userEmail={userEmail}
      userAvatarUrl={userAvatarUrl}
    />
  );
}
