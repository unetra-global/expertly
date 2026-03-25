'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import { FilterSheet } from '@/components/ui/FilterSheet';
import { Pagination } from '@/components/shared/Pagination';
import { HeroSearchBar } from '@/components/search/HeroSearchBar';
import { CategoryServiceFilter } from '@/components/ui/CategoryServiceFilter';
import type { TaxonomyCategory, TaxonomyService } from '@/components/ui/CategoryServiceFilter';
import type { ArticleListItem, PaginatedResponse } from '@/types/api';

const ARTICLE_PLACEHOLDERS = [
  'GST changes and their impact on startups...',
  'Transfer pricing explained for CFOs...',
  'SEBI regulations update 2025...',
  'Corporate restructuring in a downturn...',
  'Cross-border M&A tax implications...',
  'FEMA compliance for foreign investments...',
];

const READ_TIME_OPTIONS = [
  { label: 'Any Length', value: '' },
  { label: '< 5 mins', value: 'short' },
  { label: '5–10 mins', value: 'medium' },
  { label: '> 10 mins', value: 'long' },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function ArticleCard({ article }: { article: ArticleListItem }) {
  const authorName =
    article.author?.user.fullName ||
    [article.author?.user.firstName, article.author?.user.lastName].filter(Boolean).join(' ') ||
    'Expertly Author';

  const publishedDate = article.publishedAt
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(article.publishedAt))
    : null;

  const rawExcerpt = article.excerpt ?? '';
  const excerpt = rawExcerpt.includes('<') ? stripHtml(rawExcerpt) : rawExcerpt;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex"
    >
      {/* Thumbnail */}
      <div className="w-32 sm:w-40 flex-shrink-0 bg-brand-surface overflow-hidden">
        {article.featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featuredImageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-navy to-brand-navy-light min-h-[120px]">
            <svg className="h-8 w-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {article.category && (
            <span className="inline-flex items-center rounded-full bg-brand-blue-subtle border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-brand-blue">
              {article.category.name}
            </span>
          )}
          {article.readTimeMinutes && (
            <span className="flex items-center gap-1 text-xs text-brand-text-muted ml-auto">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.readTimeMinutes} min read
            </span>
          )}
        </div>
        <h3 className="font-semibold text-brand-navy text-sm sm:text-base leading-snug group-hover:text-brand-blue transition-colors line-clamp-2 mb-1.5">
          {article.title}
        </h3>
        {excerpt && (
          <p className="text-xs text-brand-text-secondary leading-relaxed line-clamp-2 mb-3 flex-1">
            {excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-50 mt-auto">
          {article.author?.profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.author.profilePhotoUrl} alt={authorName} className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-100" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {authorName[0]}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-brand-text-secondary truncate leading-tight">{authorName}</p>
            {(article.author?.designation || article.author?.city || article.author?.country) && (
              <p className="text-xs text-gray-400 truncate leading-tight">
                {[
                  article.author?.designation,
                  [article.author?.city, article.author?.country].filter(Boolean).join(', '),
                ].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          {publishedDate && <span className="text-xs text-brand-text-muted flex-shrink-0">{publishedDate}</span>}
        </div>
      </div>
    </Link>
  );
}

interface ArticleListProps {
  initialServiceId?: string;
  isMember?: boolean;
}

export default function ArticleList({
  initialServiceId = '',
  isMember = false,
}: ArticleListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  // Initialize state directly from URL on first render — prevents flash + wrong initial query
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(() => {
    const raw = searchParams.get('serviceIds') ?? searchParams.get('serviceId') ?? initialServiceId ?? '';
    return new Set(raw ? raw.split(',').filter(Boolean) : []);
  });
  const [readTime, setReadTime] = useState(() => searchParams.get('readTime') ?? '');
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get('q') ?? '');
  const [sort, setSort] = useState(() => searchParams.get('sort') ?? '');
  const [tag, setTag] = useState(() => searchParams.get('tag') ?? '');
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: categoriesData } = useQuery<TaxonomyCategory[]>({
    queryKey: queryKeys.taxonomy.categories(),
    queryFn: () => apiClient.get('/taxonomy/categories'),
    staleTime: 3600 * 1000,
  });

  const { data: servicesData } = useQuery<TaxonomyService[]>({
    queryKey: queryKeys.taxonomy.services(),
    queryFn: () => apiClient.get('/taxonomy/services'),
    staleTime: 3600 * 1000,
  });

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const serviceIdsString = Array.from(selectedServiceIds).sort().join(',');

  // Keep a stable ref so Effect 1 never re-runs just because the URL changed.
  // Without this, syncUrl is recreated on every URL update (searchParamsKey dep),
  // which triggers Effect 1 with stale filter state → overwrites the new URL → loop.
  const syncUrl = useCallback((svcs: string, q: string, rt: string, so: string, tg: string) => {
    const params = new URLSearchParams();
    if (svcs) params.set('serviceIds', svcs);
    if (q) params.set('q', q);
    if (rt) params.set('readTime', rt);
    if (so) params.set('sort', so);
    if (tg) params.set('tag', tg);
    const next = params.toString();
    if (next === searchParams.toString()) return;
    router.push(`/articles${next ? `?${next}` : ''}`, { scroll: false });
  }, [router, searchParams]);

  const syncUrlRef = useRef(syncUrl);
  useEffect(() => { syncUrlRef.current = syncUrl; });

  // Effect 1: filter state → URL. syncUrl intentionally excluded from deps via ref
  // to prevent firing when the URL changes externally (e.g. browser back / tag click).
  useEffect(() => {
    syncUrlRef.current(serviceIdsString, debouncedSearch, readTime, sort, tag);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceIdsString, debouncedSearch, readTime, sort, tag]);

  // Effect 2: URL → filter state (browser back/forward or external navigation).
  // Only updates state when values actually changed to avoid spurious re-renders.
  useEffect(() => {
    const raw = searchParams.get('serviceIds') ?? searchParams.get('serviceId') ?? '';
    const nextSvcs = raw ? raw.split(',').filter(Boolean) : [];
    setSelectedServiceIds(prev => {
      const prevStr = Array.from(prev).sort().join(',');
      const nextStr = [...nextSvcs].sort().join(',');
      return prevStr === nextStr ? prev : new Set(nextSvcs);
    });
    setSearch(prev => { const v = searchParams.get('q') ?? ''; return prev === v ? prev : v; });
    setReadTime(prev => { const v = searchParams.get('readTime') ?? ''; return prev === v ? prev : v; });
    setSort(prev => { const v = searchParams.get('sort') ?? ''; return prev === v ? prev : v; });
    setTag(prev => { const v = searchParams.get('tag') ?? ''; return prev === v ? prev : v; });
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsKey]);

  const readTimeFilter: Record<string, string> = {};
  if (readTime === 'short') readTimeFilter.maxReadTime = '5';
  else if (readTime === 'medium') { readTimeFilter.minReadTime = '5'; readTimeFilter.maxReadTime = '10'; }
  else if (readTime === 'long') readTimeFilter.minReadTime = '10';

  const activeFilters: Record<string, string> = {
    status: 'published',
    limit: '9',
    page: String(page),
    ...(serviceIdsString && { serviceIds: serviceIdsString }),
    ...(debouncedSearch && { q: debouncedSearch }),
    ...(sort && { sort }),
    ...(tag && { tag }),
    ...readTimeFilter,
  };

  const { data, isLoading, isError } = useQuery<PaginatedResponse<ArticleListItem>>({
    queryKey: queryKeys.articles.list(activeFilters),
    queryFn: () => {
      const qs = new URLSearchParams(activeFilters).toString();
      return apiClient.get<PaginatedResponse<ArticleListItem>>(`/articles?${qs}`);
    },
    placeholderData: (prev) => prev,
  });

  const articles = data?.data ?? [];
  const meta = data?.meta;
  const totalResults = meta?.total ?? articles.length;
  const hasFilters = !!(serviceIdsString || debouncedSearch || readTime || tag);
  const activeFilterCount = [serviceIdsString, readTime].filter(Boolean).length;

  function toggleCategory(categoryId: string, serviceIds: string[]) {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      const allSelected = serviceIds.every((id) => next.has(id));
      if (allSelected) {
        serviceIds.forEach((id) => next.delete(id));
      } else {
        serviceIds.forEach((id) => next.add(id));
      }
      return next;
    });
    setPage(1);
  }

  function toggleService(serviceId: string) {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
    setPage(1);
  }

  function clearFilters() {
    setSelectedServiceIds(new Set());
    setSearch('');
    setReadTime('');
    setSort('');
    setTag('');
    setPage(1);
  }

  const filterControls = (
    <>
      {/* CATEGORY + SERVICES (hierarchical) */}
      <div>
        <p className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-3">Category</p>
        <CategoryServiceFilter
          categories={categoriesData ?? []}
          services={servicesData ?? []}
          selectedServiceIds={selectedServiceIds}
          onToggleCategory={toggleCategory}
          onToggleService={toggleService}
        />
      </div>

      {/* READING TIME */}
      <div>
        <p className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">Reading Time</p>
        <div className="space-y-2.5">
          {READ_TIME_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                value={opt.value}
                checked={readTime === opt.value}
                onChange={() => { setReadTime(opt.value); setPage(1); }}
                className="h-4 w-4 accent-brand-blue cursor-pointer"
              />
              <span className="text-sm text-brand-text group-hover:text-brand-navy transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Share Your Expertise CTA */}
      <div className="rounded-xl bg-brand-blue p-4 text-center">
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">Share Your Expertise</p>
        <p className="text-xs text-blue-100 leading-relaxed mb-3">
          Publish articles and grow your professional brand on Expertly.
        </p>
        <Link
          href={isMember ? '/member/articles/new' : '/auth?tab=signup'}
          className="inline-flex items-center justify-center w-full text-xs font-semibold text-brand-blue bg-white hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
        >
          {isMember ? 'Write Article' : 'Start Writing'}
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Page header */}
      <div className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-label mb-2">Knowledge Hub</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Expert Articles</h1>
              <p className="mt-2 text-white/60 text-sm sm:text-base max-w-xl">
                Articles and analysis from verified finance and legal professionals.
              </p>
            </div>
            {isMember && (
              <Link
                href="/member/articles/new"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors mt-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write Article
              </Link>
            )}
          </div>

          <HeroSearchBar placeholders={ARTICLE_PLACEHOLDERS} scope="articles" />
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
                  <button onClick={clearFilters} className="text-xs font-medium text-brand-blue hover:text-brand-blue-dark transition-colors">
                    Clear all
                  </button>
                )}
              </div>
              {filterControls}
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Result count + mobile Filters button + sort */}
            <div className="flex items-center justify-between mb-5 lg:mb-6">
              <p className="text-sm text-brand-text-secondary">
                {isLoading ? (
                  <span className="inline-block w-24 h-4 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <>
                    Showing{' '}
                    <span className="font-semibold text-brand-navy">{totalResults.toLocaleString()}</span>
                    {' '}article{totalResults !== 1 ? 's' : ''}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
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
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-brand-text-muted hidden sm:inline">Sort by:</span>
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                    className="text-sm text-brand-text border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none cursor-pointer"
                  >
                    <option value="">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="read_time_asc">Shortest</option>
                    <option value="read_time_desc">Longest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active tag filter banner */}
            {tag && (
              <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl bg-brand-blue-subtle border border-blue-100">
                <svg className="w-3.5 h-3.5 text-brand-blue flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
                </svg>
                <span className="text-xs text-brand-text-secondary flex-1">
                  Showing articles tagged{' '}
                  <span className="font-semibold text-brand-blue">#{tag}</span>
                </span>
                <button
                  onClick={() => { setTag(''); setPage(1); }}
                  className="text-brand-text-muted hover:text-brand-navy transition-colors"
                  aria-label="Clear tag filter"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {isError && (
              <div className="rounded-2xl bg-red-50 border border-red-100 p-8 text-center">
                <p className="text-sm text-red-700">Failed to load articles. Please try again.</p>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse flex">
                    <div className="w-32 sm:w-40 bg-gray-100 flex-shrink-0 min-h-[120px]" />
                    <div className="flex-1 p-5 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="h-4 bg-gray-100 rounded w-full" />
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !isError && (
              <>
                {articles.length === 0 ? (
                  <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
                    <p className="text-base font-semibold text-brand-navy mb-1">No articles yet</p>
                    <p className="text-sm text-brand-text-muted">
                      {'Check back soon for expert articles.'}
                    </p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="mt-4 text-sm font-medium text-brand-blue hover:underline">
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                )}

                {meta && meta.totalPages > 1 && (
                  <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
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
