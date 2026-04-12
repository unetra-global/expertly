import { createServerClient } from '@/lib/supabase-server';
import { NavbarClient } from './NavbarClient';

interface PrefetchedUser {
  role: string;
  email?: string;
  avatarUrl?: string;
}

interface NavbarProps {
  /**
   * When a parent layout has already fetched the current user, pass it here
   * to skip redundant Supabase Auth + DB calls inside Navbar.
   * If omitted (e.g. public platform layout), Navbar fetches user data itself.
   */
  prefetchedUser?: PrefetchedUser;
}

/**
 * Server component: resolves auth state, then delegates rendering to
 * NavbarClient (client component).
 *
 * Accepts optional `prefetchedUser` from layouts that already fetched the
 * user (member/ops portals) to avoid redundant Supabase network calls.
 */
export default async function Navbar({ prefetchedUser }: NavbarProps = {}) {
  let userRole: string | null = null;
  let userAvatarUrl: string | undefined;
  let userEmail: string | undefined;

  if (prefetchedUser) {
    // Layout already fetched the user — use it directly, no extra Supabase calls.
    userRole = prefetchedUser.role;
    userEmail = prefetchedUser.email;
    userAvatarUrl = prefetchedUser.avatarUrl;
  } else {
    // Public layout or standalone usage — fetch from Supabase.
    try {
      const supabase = createServerClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const user = session.user;
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
  }

  return (
    <NavbarClient
      userRole={userRole}
      userEmail={userEmail}
      userAvatarUrl={userAvatarUrl}
    />
  );
}
