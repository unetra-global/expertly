import { Suspense } from 'react';
import NewArticlePageClient from './NewArticlePageClient';

export default function NewArticlePage() {
  return (
    <Suspense>
      <NewArticlePageClient />
    </Suspense>
  );
}
