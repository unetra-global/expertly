import { Suspense } from 'react';
import MemberDetailPageClient from './MemberDetailPageClient';

export default function MemberDetailPage() {
  return (
    <Suspense>
      <MemberDetailPageClient />
    </Suspense>
  );
}
