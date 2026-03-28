import { Suspense } from 'react';
import RegulatoryPageClient from './RegulatoryPageClient';

export default function RegulatoryPage() {
  return (
    <Suspense>
      <RegulatoryPageClient />
    </Suspense>
  );
}
