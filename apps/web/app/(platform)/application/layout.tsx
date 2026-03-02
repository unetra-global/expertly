import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';

/**
 * Guard for the /application membership route.
 *
 * Rules enforced server-side before any child page renders:
 *
 * 1. User must be authenticated — if not, redirect to /auth?returnTo=/application
 * 2. User's Supabase identity must include 'linkedin_oidc' — if they signed up
 *    via email only, redirect them to /auth/link-linkedin so they can connect
 *    LinkedIn before applying.
 */
export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();

  // getUser() verifies the JWT with Supabase — more reliable than getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── 1. Must be authenticated ───────────────────────────────
  if (!user) {
    redirect('/auth?returnTo=/application');
  }

  // ── 2. Must have LinkedIn identity linked ──────────────────
  // identities is an array of all auth providers the user has connected.
  // A LinkedIn OAuth user will have an entry with provider === 'linkedin_oidc'.
  const hasLinkedIn =
    user.identities?.some((id) => id.provider === 'linkedin_oidc') ?? false;

  if (!hasLinkedIn) {
    redirect('/auth/link-linkedin');
  }

  return <>{children}</>;
}
