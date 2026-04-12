import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';

/**
 * Guard for the /application route group.
 *
 * Single rule: user must be authenticated.
 * LinkedIn link is no longer a hard gate here — onboarding handles it
 * as an optional import flow, and the status page must be accessible
 * even before LinkedIn is connected.
 */
export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();

  // Use getSession() — reads from cookies, no network call.
  // Middleware now validates JWT for /application routes via getUser() before
  // this layout runs, so a second network call here is redundant.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect('/auth?returnTo=/application');
  }

  return <>{children}</>;
}
