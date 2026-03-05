import { createServerClient } from '@/lib/supabase-server';
import { NavbarClient } from './NavbarClient';

/**
 * Server component: reads the Supabase session to determine auth state,
 * then delegates rendering to NavbarClient (client component).
 */
export default async function Navbar() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;
  let userAvatarUrl: string | undefined;

  if (user) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('supabase_uid', user.id)
      .maybeSingle();

    userRole = dbUser?.role ?? 'user';

    // Optionally fetch member avatar using internal user id
    if (dbUser?.role === 'member' && dbUser?.id) {
      const { data: member } = await supabase
        .from('members')
        .select('profile_photo_url')
        .eq('user_id', dbUser.id)
        .maybeSingle();
      userAvatarUrl = member?.profile_photo_url ?? undefined;
    }
  }

  return (
    <NavbarClient
      userRole={userRole}
      userEmail={user?.email}
      userAvatarUrl={userAvatarUrl}
    />
  );
}
