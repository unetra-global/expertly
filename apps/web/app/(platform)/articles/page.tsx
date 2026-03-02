import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queryClient';
import { queryKeys } from '@/hooks/queryKeys';
import ArticleList from '@/components/articles/ArticleList';
import type { ArticleListItem, PaginatedResponse } from '@/types/api';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Articles | Expertly',
  description:
    'Read expert insights and analysis from verified finance and legal professionals on the Expertly network.',
};

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1';

async function fetchArticlesServer(
  filters: Record<string, string>,
): Promise<PaginatedResponse<ArticleListItem> | null> {
  const params = new URLSearchParams({
    status: 'published',
    limit: '9',
    page: '1',
    ...filters,
  });
  try {
    const res = await fetch(`${API}/articles?${params.toString()}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success: boolean;
      data?: PaginatedResponse<ArticleListItem>;
    };
    return json.data ?? null;
  } catch {
    return null;
  }
}

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const sp = searchParams as Record<string, string>;
  const filters: Record<string, string> = {
    ...(sp.category && { category: sp.category }),
  };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.articles.list({ ...filters, status: 'published', limit: '9', page: '1' }),
    queryFn: () => fetchArticlesServer(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArticleList initialCategory={sp.category ?? ''} />
    </HydrationBoundary>
  );
}
