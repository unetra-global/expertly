import { Suspense } from 'react';
import ArticlesPageClient from './ArticlesPageClient';

export default function ArticlesPage() {
  return (
    <Suspense>
      <ArticlesPageClient />
    </Suspense>
  );
}
