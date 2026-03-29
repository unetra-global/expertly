import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ArticleCardData {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  body?: string;
  coverImageUrl?: string;
  /** From full ArticleListItem shape — may be present in homepage API response */
  featuredImageUrl?: string;
  readTime?: number;
  readTimeMinutes?: number;
  publishedAt?: string;
  category?: { id?: string; name: string };
  author?: {
    slug?: string;
    profilePhotoUrl?: string;
    designation?: string;
    city?: string;
    country?: string;
    user?: {
      firstName?: string;
      lastName?: string;
      fullName?: string;
    };
  };
}

interface ArticleCardProps {
  article: ArticleCardData;
  className?: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Strip HTML tags for plain-text display in excerpts */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  const authorName =
    article.author?.user?.fullName ||
    [article.author?.user?.firstName, article.author?.user?.lastName]
      .filter(Boolean)
      .join(' ') ||
    null;

  const imageUrl = article.coverImageUrl || article.featuredImageUrl;
  const readMinutes = article.readTime || article.readTimeMinutes;
  const rawExcerpt = article.excerpt ?? '';
  const excerpt = rawExcerpt.includes('<') ? stripHtml(rawExcerpt) : rawExcerpt;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className={cn(
        'group block bg-white rounded-2xl border border-gray-100 hover:border-brand-gold/40 hover:shadow-card-hover transition-all duration-200 overflow-hidden',
        className,
      )}
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-blue flex items-center justify-center">
            <svg
              className="h-10 w-10 text-white/20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        )}

        {/* Category + read time overlaid */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {article.category?.name && (
            <span className="inline-flex items-center rounded-full bg-brand-navy/75 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
              {article.category.name}
            </span>
          )}
          {readMinutes && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/85 backdrop-blur-sm px-2 py-0.5 text-[11px] font-semibold text-brand-navy">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readMinutes} min
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-brand-navy leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors text-sm sm:text-base">
          {article.title}
        </h3>

        {excerpt && (
          <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Author row */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2.5 min-w-0">
            {article.author?.profilePhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.author.profilePhotoUrl}
                alt={authorName ?? 'Author'}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-gray-100"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-navy flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {authorName?.[0]?.toUpperCase() ?? 'E'}
              </div>
            )}
            <div className="min-w-0">
              {authorName && (
                <p className="text-xs font-semibold text-brand-navy truncate leading-tight">
                  {authorName}
                </p>
              )}
              {article.publishedAt && (
                <p className="text-[11px] text-gray-400 leading-tight">
                  {formatDate(article.publishedAt)}
                </p>
              )}
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue group-hover:text-brand-gold group-hover:gap-1.5 transition-all flex-shrink-0">
            Read
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
