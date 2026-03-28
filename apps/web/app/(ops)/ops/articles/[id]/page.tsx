import { Suspense } from 'react';
import ArticleDetailPageClient from './ArticleDetailPageClient';

export default function ArticleDetailPage() {
  return (
    <Suspense>
      <ArticleDetailPageClient />
    </Suspense>
  );
}
