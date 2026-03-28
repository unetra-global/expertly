export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import LinkLinkedInClient from './LinkLinkedInClient';

export default function LinkLinkedInPage() {
  return (
    <Suspense>
      <LinkLinkedInClient />
    </Suspense>
  );
}
