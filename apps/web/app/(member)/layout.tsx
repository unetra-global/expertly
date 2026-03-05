import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * Member portal layout — guards all /member/* routes.
 * Redirects to /auth if the user is not authenticated or not a member.
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

  if (!dbUser || dbUser.role !== 'member') {
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
