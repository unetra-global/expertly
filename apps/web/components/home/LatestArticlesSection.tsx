import Link from 'next/link';
import { ArticleCard, type ArticleCardData } from '@/components/shared/ArticleCard';

interface LatestArticlesSectionProps {
  articles: ArticleCardData[];
}

export default function LatestArticlesSection({
  articles,
}: LatestArticlesSectionProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-label mb-1">KNOWLEDGE BASE</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              Articles
            </h2>
          </div>
          <Link
            href="/articles"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors"
          >
            View All
            <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 py-12 text-center">
            <p className="text-sm text-brand-text-muted">No insights published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
