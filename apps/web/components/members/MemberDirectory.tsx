'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import { MemberCard } from './MemberCard';
import { FilterSheet } from '@/components/ui/FilterSheet';
import { HeroSearchBar } from '@/components/search/HeroSearchBar';
import type { MemberListItem, PaginatedResponse } from '@/types/api';

const MEMBER_PLACEHOLDERS = [
  'US incorporation specialist in Singapore...',
  'Transfer pricing expert in Delhi...',
  'Tax lawyer based in Mumbai...',
  'M&A advisor in London...',
  'GST consultant in Bangalore...',
  'Corporate law expert in Dubai...',
];

const COUNTRIES = [
  'Australia', 'Canada', 'Hong Kong', 'India', 'Malaysia', 'Singapore',
  'United Arab Emirates', 'United Kingdom', 'United States',
];

const EXPERIENCE_OPTIONS = [
  { label: 'Any Experience', value: '' },
  { label: '5+ Years', value: '5' },
  { label: '10+ Years', value: '10' },
  { label: '15+ Years', value: '15' },
  { label: '20+ Years', value: '20' },
];

const MAX_HOURLY_MAX = 1000;

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
  const searchParamsKey = searchParams.toString();

  const [service, setService] = useState(initialFilters.serviceId ?? initialFilters.service ?? '');
  const [country, setCountry] = useState(initialFilters.country ?? '');
  const [search, setSearch] = useState(initialFilters.q ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.q ?? '');
  const [minYears, setMinYears] = useState(initialFilters.minYears ?? '');
  const [maxHourly, setMaxHourly] = useState(Number(initialFilters.maxHourly ?? MAX_HOURLY_MAX));
  const [sort, setSort] = useState(initialFilters.sort ?? '');
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: taxonomyData } = useQuery<Array<{ id: string; name: string; slug?: string; category?: { name: string } }>>({
    queryKey: queryKeys.taxonomy.services(),
    queryFn: () => apiClient.get('/taxonomy/services'),
    staleTime: 3600 * 1000,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!service || !taxonomyData?.length) return;
    const existsById = taxonomyData.some((s) => s.id === service);
    if (existsById) return;
    const normalized = service.trim().toLowerCase();
    const mapped = taxonomyData.find((s) =>
      s.name.trim().toLowerCase() === normalized ||
      s.slug?.trim().toLowerCase() === normalized,
    );
    if (mapped) {
      setService(mapped.id);
    }
  }, [service, taxonomyData]);

  const hasServiceById = !!service && (taxonomyData ?? []).some((s) => s.id === service);
  const resolvedServiceId = hasServiceById ? service : '';
  const isWaitingForTaxonomy = !!service && !hasServiceById && taxonomyData === undefined;
  const isResolvingLegacyService = !!service && !hasServiceById && !!taxonomyData?.length;

  const syncUrl = useCallback((s: string, c: string, q: string, my: string, mh: number, so: string) => {
    const params = new URLSearchParams();
    if (s) params.set('serviceId', s);
    if (c) params.set('country', c);
    if (q) params.set('q', q);
    if (my) params.set('minYears', my);
    if (mh < MAX_HOURLY_MAX) params.set('maxHourly', String(mh));
    if (so) params.set('sort', so);
    const next = params.toString();
    if (next === searchParamsKey) return;
    router.push(`/members${next ? `?${next}` : ''}`, { scroll: false });
  }, [router, searchParamsKey]);

  useEffect(() => {
    if (isWaitingForTaxonomy || isResolvingLegacyService) return;
    syncUrl(resolvedServiceId, country, debouncedSearch, minYears, maxHourly, sort);
  }, [
    resolvedServiceId,
    isWaitingForTaxonomy,
    isResolvingLegacyService,
    country,
    debouncedSearch,
    minYears,
    maxHourly,
    sort,
    syncUrl,
  ]);

  useEffect(() => {
    setService(searchParams.get('serviceId') ?? searchParams.get('service') ?? '');
    setCountry(searchParams.get('country') ?? '');
    setSearch(searchParams.get('q') ?? '');
    setMinYears(searchParams.get('minYears') ?? '');
    setMaxHourly(Number(searchParams.get('maxHourly') ?? MAX_HOURLY_MAX));
    setSort(searchParams.get('sort') ?? '');
    setPage(1);
  }, [searchParamsKey, searchParams]);

  const activeFilters: Record<string, string> = {
    ...(resolvedServiceId && { serviceId: resolvedServiceId }),
    ...(country && { country }),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(minYears && { minYearsExperience: minYears }),
    ...(maxHourly < MAX_HOURLY_MAX && { maxHourlyRate: String(maxHourly) }),
    ...(sort && { sort }),
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
  const hasFilters = !!(resolvedServiceId || country || debouncedSearch || minYears || maxHourly < MAX_HOURLY_MAX);
  const activeFilterCount = [resolvedServiceId, country, minYears, maxHourly < MAX_HOURLY_MAX ? 'hourly' : ''].filter(Boolean).length;

  function clearFilters() {
    setService('');
    setCountry('');
    setSearch('');
    setDebouncedSearch('');
    setMinYears('');
    setMaxHourly(MAX_HOURLY_MAX);
    setSort('');
    setPage(1);
  }

  const guestLimitReached = !isAuthenticated && members.length >= 20;
  const maxHourlyLabel = maxHourly >= MAX_HOURLY_MAX ? 'Any' : `$${maxHourly}/hr`;

  // Shared filter controls (used in both sidebar and bottom sheet)
  const filterControls = (
    <>
      {/* CATEGORY */}
      <div>
        <p className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">Category</p>
        <div className="space-y-2.5">
          {(taxonomyData ?? []).map((s) => (
            <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={service === s.id}
                onChange={() => { setService(service === s.id ? '' : s.id); setPage(1); }}
                className="h-4 w-4 accent-brand-blue cursor-pointer rounded"
              />
              <span className="text-sm text-brand-text group-hover:text-brand-navy transition-colors">
                {s.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* COUNTRY (mobile sheet only shows this here) */}
      <div>
        <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
          Country
        </label>
        <select
          value={country}
          onChange={(e) => { setCountry(e.target.value); setPage(1); }}
          className="w-full px-3 py-2.5 text-sm text-brand-text bg-brand-surface border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none cursor-pointer"
        >
          <option value="">All Countries</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* MIN EXPERIENCE */}
      <div>
        <p className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
          Min Experience
        </p>
        <div className="space-y-2.5">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                value={opt.value}
                checked={minYears === opt.value}
                onChange={() => { setMinYears(opt.value); setPage(1); }}
                className="h-4 w-4 accent-brand-blue cursor-pointer"
              />
              <span className="text-sm text-brand-text group-hover:text-brand-navy transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* MAX HOURLY */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-brand-navy uppercase tracking-wider">Max Hourly</p>
          <span className="text-xs font-semibold text-brand-blue">{maxHourlyLabel}</span>
        </div>
        <input
          type="range"
          min={50}
          max={MAX_HOURLY_MAX}
          step={50}
          value={maxHourly}
          onChange={(e) => { setMaxHourly(Number(e.target.value)); setPage(1); }}
          className="w-full accent-brand-blue cursor-pointer"
        />
        <div className="flex justify-between text-xs text-brand-text-muted mt-1">
          <span>$50</span>
          <span>$1k+</span>
        </div>
      </div>

      {/* Join CTA — shown to unauthenticated users */}
      {!isAuthenticated && (
        <div className="rounded-xl bg-brand-blue p-4 text-center">
          <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">Join Expertly Today</p>
          <p className="text-xs text-blue-100 leading-relaxed mb-3">
            Get full access to verified professionals and advanced filters.
          </p>
          <Link
            href="/auth?tab=signup"
            className="inline-flex items-center justify-center w-full text-xs font-semibold text-brand-blue bg-white hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
          >
            Become a Member
          </Link>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Page header */}
      <div className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <p className="section-label mb-2">Our Network</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Find Financial &amp; Legal Experts</h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base max-w-xl">
            Browse verified finance and legal professionals from around the world.
          </p>

          <HeroSearchBar placeholders={MEMBER_PLACEHOLDERS} scope="members" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar — desktop only ────────────────────── */}
          <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 lg:sticky lg:top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider">Filters</h2>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-brand-blue hover:text-brand-blue-dark transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {filterControls}
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Mobile: result count + Filters button row */}
            <div className="flex items-center justify-between mb-5 lg:mb-6">
              <p className="text-sm text-brand-text-secondary">
                {isLoading ? (
                  <span className="inline-block w-24 h-4 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <>
                    Showing{' '}
                    <span className="font-semibold text-brand-navy">{totalResults.toLocaleString()}</span>
                    {' '}professional{totalResults !== 1 ? 's' : ''}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                {/* Mobile Filters button */}
                <button
                  onClick={() => setSheetOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-brand-text hover:bg-brand-surface transition-colors"
                >
                  <svg className="h-4 w-4 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-blue text-white text-xs font-bold leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {/* Sort dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-brand-text-muted hidden sm:inline">Sort by:</span>
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                    className="text-sm text-brand-text border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none cursor-pointer"
                  >
                    <option value="">Relevance</option>
                    <option value="fee_asc">Fee: Low–High</option>
                    <option value="fee_desc">Fee: High–Low</option>
                    <option value="experience_desc">Most Experienced</option>
                  </select>
                </div>
              </div>
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
                  <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-brand-surface flex items-center justify-center mx-auto mb-4">
                      <svg className="h-7 w-7 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-brand-navy mb-1">No members found</h3>
                    <p className="text-sm text-brand-text-muted mb-4">Try adjusting your filters or search query.</p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-sm font-medium text-brand-blue hover:underline">
                        Clear all filters
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
                      />
                    ))}
                  </div>
                )}

                {/* Guest gate */}
                {guestLimitReached && (
                  <div className="mt-6 rounded-2xl bg-brand-navy p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-brand-blue/20 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-6 w-6 text-brand-blue-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Sign in to see more</h3>
                    <p className="text-white/60 text-sm mb-5 max-w-sm mx-auto">
                      You&apos;ve reached the preview limit. Sign in for unlimited access.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Link href="/auth" className="btn-primary-dark px-6">Sign In</Link>
                      <Link href="/auth?tab=signup" className="btn-outline-white px-6">Create Account</Link>
                    </div>
                  </div>
                )}

                {/* Pagination */}
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
                    <span className="px-3 py-2 text-sm text-brand-text-secondary">
                      {page} / {meta.totalPages}
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

      {/* Mobile Filter Bottom Sheet */}
      <FilterSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onClear={clearFilters}
        hasFilters={hasFilters}
      >
        {filterControls}
      </FilterSheet>

    </>
  );
}
