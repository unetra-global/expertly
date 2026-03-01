import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ArticleCardData {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
  readTime?: number;
  publishedAt?: string;
  author?: {
    slug?: string;
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

export function ArticleCard({ article, className }: ArticleCardProps) {
  const authorName =
    article.author?.user?.fullName ||
    [article.author?.user?.firstName, article.author?.user?.lastName]
      .filter(Boolean)
      .join(' ') ||
    null;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className={cn(
        'group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden',
        className,
      )}
    >
      {/* Cover image */}
      {article.coverImageUrl ? (
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-brand-navy to-brand-navy-light flex items-center justify-center">
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

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-brand-navy leading-snug line-clamp-2 group-hover:text-brand-navy text-sm sm:text-base">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-1.5 min-w-0">
            {authorName && (
              <span className="font-medium text-gray-600 truncate">
                {authorName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {article.readTime && (
              <span className="flex items-center gap-1">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {article.readTime} min
              </span>
            )}
            {article.publishedAt && (
              <span>{formatDate(article.publishedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
