import { Suspense } from 'react';
import OpsOverviewPageClient from './OpsOverviewPageClient';

export default function OpsOverviewPage() {
  return (
    <Suspense>
      <OpsOverviewPageClient />
    </Suspense>
  );
}
