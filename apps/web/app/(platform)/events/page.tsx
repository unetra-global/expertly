import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queryClient';
import { queryKeys } from '@/hooks/queryKeys';
import EventsClient from '@/components/events/EventsClient';
import type { EventListItem, PaginatedResponse, PaginationMeta } from '@/types/api';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Events | Expertly',
  description:
    'Discover upcoming finance and legal events. Conferences, webinars, and networking opportunities for professionals.',
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002') + '/api/v1';

async function fetchEventsServer(
  filters: Record<string, string>,
): Promise<PaginatedResponse<EventListItem> | null> {
  const params = new URLSearchParams({ upcoming: 'true', limit: '20', page: '1', ...filters });
  try {
    const res = await fetch(`${API_BASE}/events?${params.toString()}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success: boolean;
      data?: EventListItem[];
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

export default async function EventsPage({ searchParams }: PageProps) {
  const sp = searchParams as Record<string, string>;
  const filters: Record<string, string> = {
    ...(sp.q && { q: sp.q }),
    ...(sp.country && { country: sp.country }),
    ...(sp.format && { format: sp.format }),
    ...(sp.startDateFrom && { startDateFrom: sp.startDateFrom }),
    ...(sp.startDateTo && { startDateTo: sp.startDateTo }),
    ...(sp.sort && { sort: sp.sort }),
  };

  const queryClient = getQueryClient();
  const prefetchFilters = { upcoming: 'true', limit: '20', page: '1', ...filters };
  await queryClient.prefetchQuery({
    queryKey: queryKeys.events.list(prefetchFilters),
    queryFn: () => fetchEventsServer(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventsClient initialFilters={filters} />
    </HydrationBoundary>
  );
}
