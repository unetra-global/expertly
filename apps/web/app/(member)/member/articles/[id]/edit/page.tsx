import { Suspense } from 'react';
import EditArticlePageClient from './EditArticlePageClient';

export default function EditArticlePage() {
  return (
    <Suspense>
      <EditArticlePageClient />
    </Suspense>
  );
}
