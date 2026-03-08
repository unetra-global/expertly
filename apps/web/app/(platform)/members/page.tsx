import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerClient } from '@/lib/supabase-server';
import { getQueryClient } from '@/lib/queryClient';
import { queryKeys } from '@/hooks/queryKeys';
import MemberDirectory from '@/components/members/MemberDirectory';
import type { PaginatedResponse, MemberListItem, PaginationMeta } from '@/types/api';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Member Directory | Expertly',
  description:
    'Browse verified finance and legal professionals from around the world. Filter by service and country.',
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002') + '/api/v1';

async function fetchMembersServer(
  filters: Record<string, string>,
): Promise<PaginatedResponse<MemberListItem> | null> {
  const params = new URLSearchParams(filters);
  try {
    const res = await fetch(`${API_BASE}/members?${params.toString()}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success: boolean;
      data?: MemberListItem[];
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

export default async function MembersPage({ searchParams }: PageProps) {
  // Resolve auth state server-side to determine card variant
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sp = searchParams as Record<string, string>;
  const filters: Record<string, string> = {
    ...(sp.serviceId && { serviceId: sp.serviceId }),
    ...(sp.country && { country: sp.country }),
    ...(sp.search && { search: sp.search }),
    limit: '20',
    page: '1',
  };

  // Prefetch first page so MemberDirectory renders without a loading flash
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.members.list(filters),
    queryFn: () => fetchMembersServer(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MemberDirectory initialFilters={sp} isAuthenticated={!!user} />
    </HydrationBoundary>
  );
}
