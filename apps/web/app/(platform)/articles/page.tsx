export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerClient } from '@/lib/supabase-server';
import { getQueryClient } from '@/lib/queryClient';
import { queryKeys } from '@/hooks/queryKeys';
import ArticleList from '@/components/articles/ArticleList';
import type { ArticleListItem, PaginatedResponse, PaginationMeta } from '@/types/api';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Articles | Expertly',
  description:
    'Read expert articles and analysis from verified finance and legal professionals on the Expertly network.',
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002') + '/api/v1';

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
    const res = await fetch(`${API_BASE}/articles?${params.toString()}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success: boolean;
      data?: ArticleListItem[];
      meta?: PaginationMeta;
    };
    if (!json.data || !json.meta) return null;
    return { data: json.data, meta: json.meta };
  } catch {
    return null;
  }
}

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function isUuid(value: string | undefined): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const sp = searchParams as Record<string, string>;
  const serviceId = isUuid(sp.serviceId) ? sp.serviceId : undefined;
  const filters: Record<string, string> = {
    ...(serviceId && { serviceId }),
    ...(sp.q && { q: sp.q }),
    ...(sp.sort && { sort: sp.sort }),
    ...(sp.minReadTime && { minReadTime: sp.minReadTime }),
    ...(sp.maxReadTime && { maxReadTime: sp.maxReadTime }),
  };

  // Check if the logged-in user is a member
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isMember = false;
  if (user) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('supabase_uid', user.id)
      .maybeSingle();
    isMember = dbUser?.role === 'member';
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.articles.list({ ...filters, status: 'published', limit: '9', page: '1' }),
    queryFn: () => fetchArticlesServer(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArticleList
        initialServiceId={serviceId ?? ''}
        isMember={isMember}
      />
    </HydrationBoundary>
  );
}
