import { Suspense } from 'react';
import ApplicationDetailPageClient from './ApplicationDetailPageClient';

export default function ApplicationDetailPage() {
  return (
    <Suspense>
      <ApplicationDetailPageClient />
    </Suspense>
  );
}
