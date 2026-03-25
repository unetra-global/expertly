import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ArticleCardData {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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
        'group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden',
        className,
      )}
    >
      {/* Cover image with category overlay */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-navy to-brand-blue flex items-center justify-center">
            <svg
              className="h-10 w-10 text-white/30"
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
        {/* Category badge — overlaid on image */}
        {article.category?.name && (
          <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/50 px-2.5 py-1 text-xs font-semibold text-brand-navy shadow-sm uppercase tracking-wide">
            {article.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-brand-navy leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors text-sm sm:text-base mb-2">
          {article.title}
        </h3>

        {excerpt && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
            {excerpt}
          </p>
        )}

        {/* Author row */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2.5 min-w-0">
            {article.author?.profilePhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.author.profilePhotoUrl}
                alt={authorName ?? 'Author'}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-100"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {authorName?.[0]?.toUpperCase() ?? 'E'}
              </div>
            )}
            <div className="min-w-0">
              {authorName && (
                <p className="text-xs font-semibold text-brand-navy truncate leading-tight">
                  {authorName}
                </p>
              )}

              {article.category?.name && (
                <p className="text-xs font-medium text-gray-500 truncate leading-tight">
                  {article.category.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 text-xs text-brand-blue font-semibold">
            Read
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Date + read time — subtle footer */}
        {(article.publishedAt || readMinutes) && (
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            {readMinutes && (
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {readMinutes} min read
              </span>
            )}
            {article.publishedAt && (
              <span>{formatDate(article.publishedAt)}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
