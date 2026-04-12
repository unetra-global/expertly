export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import OpsLayout from '@/components/ops/OpsLayout';

/**
 * Inner layout for all /ops/* pages.
 * Wraps content in the OpsLayout sidebar shell.
 * The outer (ops)/layout.tsx already guards auth; this just adds the sidebar.
 */
export default async function OpsInnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  // getSession() reads from cookies — no Supabase network call.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  let isAdmin = false;
  if (user) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('supabase_uid', user.id)
      .maybeSingle();
    isAdmin = dbUser?.role === 'backend_admin';
  }

  return <OpsLayout isAdmin={isAdmin}>{children}</OpsLayout>;
}
