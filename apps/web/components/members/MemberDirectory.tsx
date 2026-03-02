'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import { MemberCard } from './MemberCard';
import { ConsultationModal } from './ConsultationModal';
import type { MemberListItem, PaginatedResponse } from '@/types/api';

// Common countries for filter dropdown
const COUNTRIES = [
  'Australia', 'Canada', 'Hong Kong', 'India', 'Malaysia', 'Singapore',
  'United Arab Emirates', 'United Kingdom', 'United States',
];

interface MemberDirectoryProps {
  initialFilters: Record<string, string>;
  isAuthenticated: boolean;
}

export default function MemberDirectory({
  initialFilters,
  isAuthenticated,
}: MemberDirectoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Controlled filter state — source of truth
  const [service, setService] = useState(initialFilters.service ?? '');
  const [country, setCountry] = useState(initialFilters.country ?? '');
  const [search, setSearch] = useState(initialFilters.q ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.q ?? '');
  const [page, setPage] = useState(1);
  const [consultMember, setConsultMember] = useState<MemberListItem | null>(null);

  // Taxonomy: services for filter (flat list)
  const { data: taxonomyData } = useQuery<Array<{ id: string; name: string; category?: { name: string } }>>({
    queryKey: queryKeys.taxonomy.services(),
    queryFn: () => apiClient.get('/taxonomy/services'),
    staleTime: 3600 * 1000,
  });

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync filter changes → URL params
  const syncUrl = useCallback((s: string, c: string, q: string) => {
    const params = new URLSearchParams();
    if (s) params.set('service', s);
    if (c) params.set('country', c);
    if (q) params.set('q', q);
    router.push(`/members${params.size ? `?${params.toString()}` : ''}`, { scroll: false });
  }, [router]);

  useEffect(() => {
    syncUrl(service, country, debouncedSearch);
  }, [service, country, debouncedSearch, syncUrl]);

  // Sync from URL params (handles browser back/forward)
  useEffect(() => {
    setService(searchParams.get('service') ?? '');
    setCountry(searchParams.get('country') ?? '');
    setSearch(searchParams.get('q') ?? '');
    setPage(1);
  }, [searchParams]);

  const activeFilters: Record<string, string> = {
    ...(service && { service }),
    ...(country && { country }),
    ...(debouncedSearch && { q: debouncedSearch }),
    limit: isAuthenticated ? '12' : '20',
    page: String(page),
  };

  const { data, isLoading, isError } = useQuery<PaginatedResponse<MemberListItem>>({
    queryKey: queryKeys.members.list(activeFilters),
    queryFn: () => {
      const qs = new URLSearchParams(activeFilters).toString();
      return apiClient.get<PaginatedResponse<MemberListItem>>(`/members?${qs}`);
    },
    placeholderData: (prev) => prev,
  });

  const members = data?.data ?? [];
  const meta = data?.meta;
  const totalResults = meta?.total ?? members.length;
  const hasFilters = !!(service || country || debouncedSearch);

  function clearFilters() {
    setService('');
    setCountry('');
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  }

  const guestLimitReached = !isAuthenticated && members.length >= 20;

  return (
    <>
      {/* Page header */}
      <div className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="section-label mb-2">Our Network</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Member Directory</h1>
          <p className="mt-3 text-white/60 text-base max-w-xl">
            Browse verified finance and legal professionals from around the world.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ──────────────────────────────────── */}
          <aside className="lg:w-64 xl:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-brand-navy">Filters</h2>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-brand-blue hover:text-brand-blue-dark transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-4">
                <label htmlFor="search" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                  Search
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    id="search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name, keyword…"
                    className="input-base pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Service filter */}
              <div className="mb-4">
                <label htmlFor="service-filter" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                  Service
                </label>
                <select
                  id="service-filter"
                  value={service}
                  onChange={(e) => { setService(e.target.value); setPage(1); }}
                  className="input-base text-sm appearance-none cursor-pointer"
                >
                  <option value="">All services</option>
                  {(taxonomyData ?? []).map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Country filter */}
              <div>
                <label htmlFor="country-filter" className="block text-xs font-medium text-brand-text-secondary mb-1.5">
                  Country
                </label>
                <select
                  id="country-filter"
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); setPage(1); }}
                  className="input-base text-sm appearance-none cursor-pointer"
                >
                  <option value="">All countries</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Guest prompt in sidebar */}
              {!isAuthenticated && (
                <div className="mt-5 rounded-xl bg-brand-blue-subtle border border-blue-100 p-4 text-center">
                  <p className="text-xs text-blue-700 leading-relaxed mb-2">
                    Sign in to unlock advanced filters and full member details.
                  </p>
                  <Link href="/auth" className="inline-flex items-center justify-center w-full text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue-dark rounded-lg px-3 py-2 transition-colors">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Result count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-brand-text-secondary">
                {isLoading ? (
                  <span className="inline-block w-24 h-4 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <>
                    <span className="font-semibold text-brand-navy">{totalResults.toLocaleString()}</span>
                    {' '}professional{totalResults !== 1 ? 's' : ''}
                    {hasFilters && ' found'}
                  </>
                )}
              </p>
            </div>

            {/* Error state */}
            {isError && (
              <div className="rounded-2xl bg-red-50 border border-red-100 p-8 text-center">
                <p className="text-sm text-red-700">Failed to load members. Please try again.</p>
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 animate-pulse">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Member list */}
            {!isLoading && !isError && (
              <>
                {members.length === 0 ? (
                  /* Empty state */
                  <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-surface flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-brand-navy mb-1">No professionals found</h3>
                    <p className="text-sm text-brand-text-muted mb-4">Try adjusting your filters or search query.</p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="btn-outline text-sm">
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        variant={isAuthenticated ? 'full' : 'teaser'}
                        onConsult={isAuthenticated ? (m) => setConsultMember(m) : undefined}
                      />
                    ))}
                  </div>
                )}

                {/* Guest gate — shown after 20 results */}
                {guestLimitReached && (
                  <div className="mt-6 rounded-2xl bg-brand-navy border border-brand-navy-light p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-brand-blue/20 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-6 w-6 text-brand-blue-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Sign in to see more professionals
                    </h3>
                    <p className="text-white/60 text-sm mb-5 max-w-sm mx-auto">
                      You&apos;ve reached the preview limit. Sign in to access the full directory with unlimited results.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Link href="/auth" className="btn-primary-dark px-6">
                        Sign In
                      </Link>
                      <Link href="/auth?tab=signup" className="btn-outline-white px-6">
                        Create Account
                      </Link>
                    </div>
                  </div>
                )}

                {/* Authenticated pagination */}
                {isAuthenticated && meta && meta.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-brand-text hover:bg-brand-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    <span className="px-4 py-2 text-sm text-brand-text-secondary">
                      Page {page} of {meta.totalPages}
                    </span>

                    <button
                      onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                      disabled={page >= meta.totalPages}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-brand-text hover:bg-brand-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Consultation modal */}
      <ConsultationModal member={consultMember} onClose={() => setConsultMember(null)} />
    </>
  );
}
