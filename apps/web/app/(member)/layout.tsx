export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * Member portal layout — guards all /member/* routes.
 * - member / ops / backend_admin: full access to all /member/* pages
 * - user: allowed through (settings page guards itself to show only digest section)
 * - unauthenticated: redirect to /auth
 */
export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();

  // Use getSession() — reads from cookies, no network call.
  // Middleware already validated the JWT with Supabase's server on every request.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect('/auth');
  }

  const user = session.user;

  const { data: dbUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('supabase_uid', user.id)
    .maybeSingle();

  const role = dbUser?.role ?? null;

  // Must be authenticated and have a known role
  if (!role) {
    redirect('/auth');
  }

  const allowedRoles = ['member', 'ops', 'backend_admin', 'user'];
  if (!allowedRoles.includes(role)) {
    redirect('/auth');
  }

  // Fetch avatar for member role (passed to Navbar to avoid a second DB query)
  let avatarUrl: string | undefined;
  if (role === 'member' && dbUser?.id) {
    const { data: memberData } = await supabase
      .from('members')
      .select('profile_photo_url')
      .eq('user_id', dbUser.id)
      .maybeSingle();
    avatarUrl = memberData?.profile_photo_url ?? undefined;
  }

  return (
    <>
      <Navbar prefetchedUser={{ role, email: user.email, avatarUrl }} />
      <main className="flex-1 min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}
