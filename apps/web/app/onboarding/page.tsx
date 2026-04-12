export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export const metadata = {
  title: 'Apply for Membership | Expertly',
  description:
    'Join the Expertly network of verified finance and legal professionals. Complete your membership application.',
};

export default async function OnboardingPage() {
  const supabase = createServerClient();

  // Single auth call: getSession() reads from cookies, no network call.
  // Middleware already validated the JWT via getUser() for /onboarding routes,
  // so we don't need to repeat that validation here.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 1. Must be authenticated (middleware redirects unauthenticated users, but
  //    guard here as a safety net for environments where middleware is bypassed)
  if (!session?.user) {
    redirect('/auth?returnTo=/onboarding');
  }

  // 2. Check for an existing application and redirect appropriately
  try {
    const token = session.access_token;

    if (token) {
      const res = await fetch(`${API_BASE}/api/v1/applications/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (res.ok) {
        const json = (await res.json()) as {
          success: boolean;
          data?: { status: string };
        };
        const application = json.data;

        if (application) {
          const { status } = application;

          // Already submitted / in review / resolved → show status
          if (
            ['submitted', 'under_review', 'approved', 'waitlisted', 'rejected'].includes(
              status,
            )
          ) {
            redirect('/application/status');
          }

          // Draft in progress → resume at /application
          if (status === 'draft') {
            redirect('/application');
          }
        }
      }
    }
  } catch {
    // API unreachable — show onboarding form anyway; errors will surface on submit
  }

  return <OnboardingLayout />;
}
