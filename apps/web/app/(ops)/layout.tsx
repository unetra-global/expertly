export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/layout/Navbar';

/**
 * Ops portal layout — guards all /ops/* routes.
 * Redirects to /auth if the user is not authenticated or not ops/backend_admin.
 */
export default async function OpsLayout({
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
    .select('role')
    .eq('supabase_uid', user.id)
    .maybeSingle();

  const opsRoles = ['ops', 'backend_admin'];
  if (!dbUser || !opsRoles.includes(dbUser.role)) {
    redirect('/auth');
  }

  return (
    <>
      <Navbar prefetchedUser={{ role: dbUser.role, email: user.email }} />
      <main className="flex-1 bg-gray-50 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </>
  );
}
