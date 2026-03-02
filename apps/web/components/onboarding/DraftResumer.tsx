'use client';

import { useEffect } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { OnboardingLayout } from './OnboardingLayout';

interface Props {
  applicationId: string;
  currentStep: 1 | 2 | 3;
}

/**
 * DraftResumer — hydrates the onboarding store with the draft application's
 * saved step and applicationId, then renders the OnboardingLayout.
 *
 * This is a thin client bridge between the server page (which fetches the
 * draft) and the client store + form components.
 */
export function DraftResumer({ applicationId, currentStep }: Props) {
  const { setApplicationId, setStep, applicationId: storeAppId } = useOnboardingStore();

  useEffect(() => {
    // Only hydrate if the store doesn't already have this application
    // (avoids overwriting newer client-side state on navigation back)
    if (storeAppId !== applicationId) {
      setApplicationId(applicationId);
    }
    setStep(currentStep);
  }, [applicationId, currentStep, storeAppId, setApplicationId, setStep]);

  return <OnboardingLayout />;
}
