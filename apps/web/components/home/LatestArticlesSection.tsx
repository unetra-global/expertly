import Link from 'next/link';
import { ArticleCard, type ArticleCardData } from '@/components/shared/ArticleCard';

interface LatestArticlesSectionProps {
  articles: ArticleCardData[];
}

export default function LatestArticlesSection({
  articles,
}: LatestArticlesSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="py-20 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-2">
              Expert Knowledge
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy">
              Latest Insights
            </h2>
            <p className="mt-2 text-gray-500 text-sm sm:text-base">
              In-depth articles from verified finance and legal professionals.
            </p>
          </div>
          <Link
            href="/articles"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-navy hover:text-brand-gold transition-colors"
          >
            View all
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {/* Grid: 1 col → 2 cols → 3 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, 6).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 sm:hidden text-center">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy hover:text-brand-gold transition-colors"
          >
            View all articles →
          </Link>
        </div>
      </div>
    </section>
  );
}
