export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import AuthPageClient from './AuthClient';

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageClient />
    </Suspense>
  );
}
