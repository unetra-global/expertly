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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
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

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}
