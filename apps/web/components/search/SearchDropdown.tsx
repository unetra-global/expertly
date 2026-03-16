'use client';

import Link from 'next/link';
import type {
  AiSearchResponse,
  SearchMemberResult,
  SearchArticleResult,
  SearchEventResult,
  SearchParsedQuery,
} from '@/types/api';

interface SearchDropdownProps {
  results: AiSearchResponse;
  query: string;
  onClose: () => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function MemberResult({ member, onClose }: { member: SearchMemberResult; onClose: () => void }) {
  const fullName =
    member.users
      ? `${member.users.firstName ?? ''} ${member.users.lastName ?? ''}`.trim()
      : 'Member';
  const initials = fullName[0]?.toUpperCase() ?? 'M';

  return (
    <Link
      href={`/members/${member.slug}`}
      onClick={onClose}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-surface transition-colors"
    >
      {member.profilePhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.profilePhotoUrl}
          alt={fullName}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-semibold">{initials}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-brand-text truncate">{fullName}</p>
          {member.isVerified && (
            <svg className="w-3.5 h-3.5 text-brand-blue flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-label="Verified">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <p className="text-xs text-brand-text-muted truncate">
          {member.designation}
          {member.city && ` · ${member.city}`}
          {member.services?.name && ` · ${member.services.name}`}
        </p>
      </div>
    </Link>
  );
}

function ArticleResult({ article, onClose }: { article: SearchArticleResult; onClose: () => void }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      onClick={onClose}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-surface transition-colors"
    >
      {article.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImageUrl}
          alt={article.title}
          className="w-12 h-9 rounded object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-9 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-brand-text line-clamp-1">{article.title}</p>
        {article.publishedAt && (
          <p className="text-xs text-brand-text-muted">{formatDate(article.publishedAt)}</p>
        )}
      </div>
    </Link>
  );
}

function EventResult({ event, onClose }: { event: SearchEventResult; onClose: () => void }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      onClick={onClose}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-surface transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-brand-blue-subtle flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-brand-text line-clamp-1">{event.title}</p>
        <p className="text-xs text-brand-text-muted">
          {event.startDate ? formatDate(event.startDate) : ''}
          {event.city && ` · ${event.city}`}
          {event.isVirtual && ' · Online'}
        </p>
      </div>
    </Link>
  );
}

function InterpretedAs({ parsed }: { parsed: SearchParsedQuery }) {
  const parts: string[] = [];
  if (parsed.filters.city) parts.push(parsed.filters.city);
  if (parsed.filters.country) parts.push(parsed.filters.country);
  if (parsed.filters.dateFrom || parsed.filters.dateTo) {
    const from = parsed.filters.dateFrom ? formatDate(parsed.filters.dateFrom) : '';
    const to = parsed.filters.dateTo ? formatDate(parsed.filters.dateTo) : '';
    parts.push(from && to ? `${from} – ${to}` : from || to);
  }
  if (parsed.filters.serviceCategory) parts.push(parsed.filters.serviceCategory);

  if (parts.length === 0) return null;

  return (
    <div className="px-4 py-2 border-b border-gray-100 bg-brand-surface/50">
      <p className="text-xs text-brand-text-muted">
        <span className="font-medium text-brand-blue capitalize">{parsed.intent}</span>
        {parts.length > 0 && (
          <> · {parts.join(' · ')}</>
        )}
      </p>
    </div>
  );
}

export function SearchDropdown({ results, query, onClose }: SearchDropdownProps) {
  const hasMembers = results.members.length > 0;
  const hasArticles = results.articles.length > 0;
  const hasEvents = results.events.length > 0;
  const hasAny = hasMembers || hasArticles || hasEvents;

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-card-hover border border-gray-100 overflow-hidden z-50 max-h-[480px] overflow-y-auto">

      {/* Interpreted as badge */}
      {results.parsedQuery && (
        <InterpretedAs parsed={results.parsedQuery} />
      )}

      {!hasAny && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-brand-text-muted">No results found for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {/* Members */}
      {hasMembers && (
        <div>
          <p className="px-4 py-2 text-xs font-semibold text-brand-text-muted uppercase tracking-wide border-b border-gray-100">
            Members
          </p>
          {results.members.slice(0, 3).map((m) => (
            <MemberResult key={m.id} member={m} onClose={onClose} />
          ))}
        </div>
      )}

      {/* Articles */}
      {hasArticles && (
        <div className={hasMembers ? 'border-t border-gray-100' : ''}>
          <p className="px-4 py-2 text-xs font-semibold text-brand-text-muted uppercase tracking-wide border-b border-gray-100">
            Articles
          </p>
          {results.articles.slice(0, 3).map((a) => (
            <ArticleResult key={a.id} article={a} onClose={onClose} />
          ))}
        </div>
      )}

      {/* Events */}
      {hasEvents && (
        <div className={(hasMembers || hasArticles) ? 'border-t border-gray-100' : ''}>
          <p className="px-4 py-2 text-xs font-semibold text-brand-text-muted uppercase tracking-wide border-b border-gray-100">
            Events
          </p>
          {results.events.slice(0, 3).map((e) => (
            <EventResult key={e.id} event={e} onClose={onClose} />
          ))}
        </div>
      )}

      {/* See all results */}
      {hasAny && (
        <div className="border-t border-gray-100">
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-brand-blue hover:bg-brand-blue-subtle transition-colors"
          >
            See all results
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
