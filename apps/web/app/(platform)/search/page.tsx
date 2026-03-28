'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import type {
  AiSearchResponse,
  SearchMemberResult,
  SearchArticleResult,
  SearchEventResult,
} from '@/types/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ── Member card ───────────────────────────────────────────────────────────────

function MemberCard({ member }: { member: SearchMemberResult }) {
  const fullName = member.users
    ? `${member.users.firstName ?? ''} ${member.users.lastName ?? ''}`.trim()
    : 'Member';
  const initials = fullName[0]?.toUpperCase() ?? 'M';

  return (
    <Link
      href={`/members/${member.slug}`}
      className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow bg-white"
    >
      {member.profilePhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.profilePhotoUrl}
          alt={fullName}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold">{initials}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-brand-text">{fullName}</h3>
          {member.isVerified && (
            <svg className="w-4 h-4 text-brand-blue flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        {member.designation && (
          <p className="text-sm text-brand-text-secondary">{member.designation}</p>
        )}
        {member.headline && (
          <p className="text-sm text-brand-text-muted mt-1 line-clamp-2">{member.headline}</p>
        )}
        {(member.city || member.services?.name) && (
          <div className="flex items-center gap-2 mt-2">
            {member.services?.name && (
              <span className="text-xs px-2 py-0.5 bg-brand-blue-subtle text-brand-blue rounded-full font-medium">
                {member.services.name}
              </span>
            )}
            {member.city && (
              <span className="text-xs text-brand-text-muted">{member.city}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Article card ──────────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: SearchArticleResult }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="flex gap-4 p-4 rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow bg-white"
    >
      {article.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImageUrl}
          alt={article.title}
          className="w-24 h-16 rounded-lg object-cover flex-shrink-0 hidden sm:block"
        />
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-brand-text line-clamp-2">{article.title}</h3>
        {article.excerpt && (
          <p className="text-sm text-brand-text-muted mt-1 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          {article.publishedAt && (
            <span className="text-xs text-brand-text-muted">{formatDate(article.publishedAt)}</span>
          )}
          {article.readTime && (
            <span className="text-xs text-brand-text-muted">{article.readTime} min read</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Event card ────────────────────────────────────────────────────────────────

function EventCard({ event }: { event: SearchEventResult }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="flex gap-4 p-4 rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow bg-white"
    >
      <div className="w-12 h-12 rounded-xl bg-brand-blue-subtle flex items-center justify-center flex-shrink-0">
        <svg className="w-6 h-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-brand-text line-clamp-2">{event.title}</h3>
        {event.description && (
          <p className="text-sm text-brand-text-muted mt-1 line-clamp-2">{event.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          {event.startDate && (
            <span className="text-xs text-brand-text-muted">{formatDate(event.startDate)}</span>
          )}
          {event.city && (
            <span className="text-xs text-brand-text-muted">{event.city}</span>
          )}
          {event.isVirtual && (
            <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">Online</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-2xl bg-gray-100" />
      ))}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function ResultSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wide">
          {title}
        </h2>
        <span className="text-xs text-brand-text-muted">{count} result{count !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SCOPE_LABELS: Record<string, string> = {
  members: 'Members',
  articles: 'Articles',
  events: 'Events',
};

const SCOPE_SUGGESTIONS: Record<string, string[]> = {
  members: [
    'GST experts in Delhi',
    'US incorporation specialists',
    'Transfer pricing advisors',
    'Corporate lawyers in Mumbai',
  ],
  articles: [
    'GST regulation changes',
    'US corporate tax reform',
    'Transfer pricing guidelines',
    'Cross-border M&A insights',
  ],
  events: [
    'Conferences in Singapore',
    'Online tax webinars',
    'Legal networking events',
    'Finance summits this quarter',
  ],
  all: [
    'GST experts in Delhi',
    'US incorporation specialists',
    'Events in Singapore this month',
    'Transfer pricing articles',
  ],
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';
  const scope = (searchParams.get('scope') as 'members' | 'articles' | 'events' | undefined) ?? undefined;

  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [results, setResults] = useState<AiSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.search.ai(q.trim(), scope);
      setResults(data);
      setActiveQuery(q.trim());
      const newUrl = scope
        ? `/search?q=${encodeURIComponent(q.trim())}&scope=${scope}`
        : `/search?q=${encodeURIComponent(q.trim())}`;
      router.replace(newUrl, { scroll: false });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [router, scope]);

  // Run initial search from URL param
  useEffect(() => {
    if (initialQuery.trim().length >= 2) {
      void runSearch(initialQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void runSearch(val), 500);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    void runSearch(inputValue);
  }

  const showMembers = !scope || scope === 'members';
  const showArticles = !scope || scope === 'articles';
  const showEvents = !scope || scope === 'events';

  const totalResults =
    (showMembers ? (results?.members.length ?? 0) : 0) +
    (showArticles ? (results?.articles.length ?? 0) : 0) +
    (showEvents ? (results?.events.length ?? 0) : 0);

  const suggestions = SCOPE_SUGGESTIONS[scope ?? 'all'] ?? SCOPE_SUGGESTIONS.all;

  const { parsedQuery } = results ?? {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Search header ─────────────────────────────────── */}
      <div className="bg-brand-navy py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {scope && (
            <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-3">
              {SCOPE_LABELS[scope]}
            </p>
          )}
          <form onSubmit={handleSubmit} className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={
                scope === 'members' ? 'Try "GST expert in Delhi" or "corporate lawyer in Mumbai"'
                : scope === 'articles' ? 'Try "GST regulation changes" or "cross-border M&A"'
                : scope === 'events' ? 'Try "conferences in Singapore" or "online tax webinars"'
                : 'Try "GST expert in Delhi" or "events in Mumbai this March"'
              }
              autoFocus
              autoComplete="off"
              className="w-full pl-12 pr-4 py-3.5 text-white bg-white/10 placeholder-white/30 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-base"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
          </form>

          {/* Interpreted query badge */}
          {parsedQuery && activeQuery && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-white/50">Interpreted as:</span>
              <span className="text-xs text-white/70 font-medium capitalize">{parsedQuery.intent}</span>
              {parsedQuery.filters.city && (
                <span className="text-xs px-2 py-0.5 bg-white/10 text-white/70 rounded-full">
                  {parsedQuery.filters.city}
                </span>
              )}
              {parsedQuery.filters.country && (
                <span className="text-xs px-2 py-0.5 bg-white/10 text-white/70 rounded-full">
                  {parsedQuery.filters.country}
                </span>
              )}
              {parsedQuery.filters.dateFrom && (
                <span className="text-xs px-2 py-0.5 bg-white/10 text-white/70 rounded-full">
                  {formatDate(parsedQuery.filters.dateFrom)}
                  {parsedQuery.filters.dateTo && ` – ${formatDate(parsedQuery.filters.dateTo)}`}
                </span>
              )}
              {parsedQuery.filters.serviceCategory && (
                <span className="text-xs px-2 py-0.5 bg-white/10 text-white/70 rounded-full">
                  {parsedQuery.filters.serviceCategory}
                </span>
              )}
              {parsedQuery.filters.isVirtual && (
                <span className="text-xs px-2 py-0.5 bg-white/10 text-white/70 rounded-full">
                  Online / Virtual
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

        {/* Loading */}
        {isLoading && !results && (
          <>
            <SearchSkeleton />
            <SearchSkeleton />
          </>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-brand-text-muted">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && results && totalResults === 0 && (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-brand-text mb-2">No results found</h3>
            <p className="text-brand-text-muted text-sm">
              Try rephrasing your search or browse{' '}
              <Link
                href={scope === 'articles' ? '/articles' : scope === 'events' ? '/events' : '/members'}
                className="text-brand-blue hover:underline"
              >
                {scope === 'articles' ? 'all articles' : scope === 'events' ? 'all events' : 'the member directory'}
              </Link>
            </p>
          </div>
        )}

        {/* Initial state */}
        {!isLoading && !results && !error && (
          <div className="text-center py-16">
            <p className="text-brand-text-muted text-sm">
              {scope
                ? `Search ${SCOPE_LABELS[scope].toLowerCase()} using natural language`
                : 'Search across members, articles, and events using natural language'}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInputValue(suggestion);
                    void runSearch(suggestion);
                  }}
                  className="text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-full text-brand-text-secondary hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && totalResults > 0 && (
          <>
            {showMembers && (
              <ResultSection title="Members" count={results.members.length}>
                {results.members.map((m) => (
                  <MemberCard key={m.id} member={m} />
                ))}
              </ResultSection>
            )}

            {showArticles && (
              <ResultSection title="Articles" count={results.articles.length}>
                {results.articles.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </ResultSection>
            )}

            {showEvents && (
              <ResultSection title="Events" count={results.events.length}>
                {results.events.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </ResultSection>
            )}
          </>
        )}
      </div>
    </div>
  );
}
