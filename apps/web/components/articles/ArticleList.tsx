'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { ArticleListItem, PaginatedResponse } from '@/types/api';

function ArticleCard({ article }: { article: ArticleListItem }) {
  const authorName =
    article.author?.user.fullName ||
    [article.author?.user.firstName, article.author?.user.lastName].filter(Boolean).join(' ') ||
    'Expertly Author';

  const publishedDate = article.publishedAt
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(article.publishedAt))
    : null;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Cover image */}
      <div className="aspect-[16/9] bg-brand-surface overflow-hidden">
        {article.featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featuredImageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-navy to-brand-navy-light">
            <svg className="h-10 w-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-5">
        {/* Category */}
        {article.serviceCategory && (
          <span className="inline-flex items-center self-start rounded-full bg-brand-blue-subtle border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-brand-blue mb-3">
            {article.serviceCategory.name}
          </span>
        )}

        {/* Title */}
        <h3 className="font-semibold text-brand-navy text-base leading-snug group-hover:text-brand-blue transition-colors line-clamp-2 mb-2">
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-sm text-brand-text-secondary leading-relaxed line-clamp-3 mb-4 flex-1">
            {article.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50 mt-auto">
          {article.author?.profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.author.profilePhotoUrl}
              alt={authorName}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-brand-navy flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {authorName[0]}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-brand-text-muted min-w-0">
            <span className="truncate font-medium text-brand-text-secondary">{authorName}</span>
            {publishedDate && (
              <>
                <span className="flex-shrink-0">·</span>
                <span className="flex-shrink-0">{publishedDate}</span>
              </>
            )}
            {article.readTimeMinutes && (
              <>
                <span className="flex-shrink-0">·</span>
                <span className="flex-shrink-0">{article.readTimeMinutes} min read</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface ArticleListProps {
  initialCategory?: string;
}

export default function ArticleList({ initialCategory = '' }: ArticleListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);

  // Fetch categories for filter
  const { data: categoriesData } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: queryKeys.taxonomy.categories(),
    queryFn: () => apiClient.get('/taxonomy/categories'),
    staleTime: 3600 * 1000,
  });

  // Sync category filter ↔ URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    router.push(`/articles${params.size ? `?${params.toString()}` : ''}`, { scroll: false });
  }, [category, router]);

  useEffect(() => {
    setCategory(searchParams.get('category') ?? '');
    setPage(1);
  }, [searchParams]);

  const activeFilters: Record<string, string> = {
    status: 'published',
    limit: '9',
    page: String(page),
    ...(category && { category }),
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

  return (
    <>
      {/* Page header */}
      <div className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="section-label mb-2">Knowledge Hub</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Expert Articles</h1>
          <p className="mt-3 text-white/60 text-base max-w-xl">
            Insights and analysis from verified finance and legal professionals.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category filter tabs */}
        {(categoriesData ?? []).length > 0 && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => { setCategory(''); setPage(1); }}
              className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${!category ? 'bg-brand-blue border-brand-blue text-white' : 'bg-white border-gray-200 text-brand-text hover:border-brand-blue/30'}`}
            >
              All
            </button>
            {(categoriesData ?? []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.name); setPage(1); }}
                className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${category === cat.name ? 'bg-brand-blue border-brand-blue text-white' : 'bg-white border-gray-200 text-brand-text hover:border-brand-blue/30'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Result count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-brand-text-secondary">
            {isLoading ? (
              <span className="inline-block w-24 h-4 bg-gray-100 rounded animate-pulse" />
            ) : (
              <>
                <span className="font-semibold text-brand-navy">{totalResults.toLocaleString()}</span>
                {' '}article{totalResults !== 1 ? 's' : ''}
                {category && ` in ${category}`}
              </>
            )}
          </p>
        </div>

        {/* Error */}
        {isError && (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-8 text-center">
            <p className="text-sm text-red-700">Failed to load articles. Please try again.</p>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-gray-100" />
                <div className="p-5 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Article grid */}
        {!isLoading && !isError && (
          <>
            {articles.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
                <p className="text-base font-semibold text-brand-navy mb-1">No articles yet</p>
                <p className="text-sm text-brand-text-muted">
                  {category ? `No articles in ${category} yet.` : 'Check back soon for expert insights.'}
                </p>
                {category && (
                  <button onClick={() => setCategory('')} className="mt-4 btn-outline text-sm">
                    View all articles
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
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
    </>
  );
}
