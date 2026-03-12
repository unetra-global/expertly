import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { DraftResumer } from '@/components/onboarding/DraftResumer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

export const metadata = {
  title: 'Your Application | Expertly',
  description: 'Resume your Expertly membership application.',
};

/**
 * /application — resume an in-progress draft application.
 *
 * The layout guard above already ensures the user is authenticated.
 *
 * Logic:
 *   • No application found  → redirect to /onboarding (start fresh)
 *   • Application is draft  → render OnboardingLayout at the saved step
 *   • Any other status      → redirect to /application/status
 */
export default async function ApplicationPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    redirect('/auth?returnTo=/application');
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/applications/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (res.status === 404 || !res.ok) {
      redirect('/onboarding');
    }

    const json = (await res.json()) as {
      success: boolean;
      data?: {
        id: string;
        status: string;
        currentStep?: 1 | 2 | 3;
      };
    };

    const application = json.data;
    if (!application) {
      redirect('/onboarding');
    }

    const { status, id, currentStep } = application;

    if (status !== 'draft') {
      redirect('/application/status');
    }

    // Render the form, hydrating the store with the draft's current step
    return <DraftResumer applicationId={id} currentStep={currentStep ?? 1} />;
  } catch {
    // API unreachable — send to onboarding so user can start/retry
    redirect('/onboarding');
  }
}
