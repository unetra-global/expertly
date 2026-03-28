export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import SearchPageClient from './SearchClient';

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageClient />
    </Suspense>
  );
}
