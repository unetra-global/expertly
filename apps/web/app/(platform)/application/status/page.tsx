import { Suspense } from 'react';
import ApplicationStatusClient from './ApplicationStatusClient';

export default function ApplicationStatusPage() {
  return (
    <Suspense>
      <ApplicationStatusClient />
    </Suspense>
  );
}
