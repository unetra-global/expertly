import { Suspense } from 'react';
import DashboardPageClient from './DashboardPageClient';

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardPageClient />
    </Suspense>
  );
}
