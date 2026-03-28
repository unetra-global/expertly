import { Suspense } from 'react';
import BroadcastPageClient from './BroadcastPageClient';

export default function BroadcastPage() {
  return (
    <Suspense>
      <BroadcastPageClient />
    </Suspense>
  );
}
