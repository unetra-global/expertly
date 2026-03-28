'use client';

import { useParams } from 'next/navigation';
import ArticleEditor from '@/components/member/ArticleEditor';

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  return <ArticleEditor articleId={id} />;
}
