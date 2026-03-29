import Link from 'next/link';
import type { ArticleCardData } from '@/components/shared/ArticleCard';

interface LatestArticlesSectionProps {
  articles: ArticleCardData[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function AuthorRow({ article, compact = false }: { article: ArticleCardData; compact?: boolean }) {
  const authorName =
    article.author?.user?.fullName ||
    [article.author?.user?.firstName, article.author?.user?.lastName].filter(Boolean).join(' ') ||
    null;
  const designation = article.author?.designation;
  const country = article.author?.country;

  const avatarCls = compact ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';

  return (
    <div className="flex items-center gap-2 min-w-0">

      {article.author?.profilePhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.author.profilePhotoUrl}
          alt={authorName ?? 'Author'}
          className={`${avatarCls} rounded-full object-cover flex-shrink-0`}
        />

      ) : (
        <div className={`${avatarCls} rounded-full bg-brand-navy flex items-center justify-center text-white font-bold flex-shrink-0`}>
          {authorName?.[0]?.toUpperCase() ?? 'E'}
        </div>
      )}
      <div className="min-w-0">
        {authorName && (
          <p className={`font-semibold text-brand-navy truncate leading-tight ${compact ? 'text-[11px]' : 'text-xs'}`}>
            {authorName}
          </p>
        )}
        {compact ? (
          /* Compact: designation · country on one line, no date */
          <p className="text-[10px] text-gray-400 truncate leading-tight">
            {[designation, country].filter(Boolean).join(' · ')}
          </p>
        ) : (
          /* Full: designation, then date · country below */
          <>
            {designation && (
              <p className="text-[11px] ">
                {designation}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Large featured card — left 2/3 of top row */
function FeaturedCard({ article }: { article: ArticleCardData }) {
  const imageUrl = article.coverImageUrl || article.featuredImageUrl;
  const readMinutes = article.readTime || article.readTimeMinutes;
  const rawExcerpt = article.excerpt ?? '';
  const excerpt = rawExcerpt.includes('<') ? stripHtml(rawExcerpt) : rawExcerpt;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-brand-navy hover:border-brand-gold/40 hover:shadow-card-hover transition-all duration-200 overflow-hidden h-full"
    >
      {/* Image */}
      <div className="relative h-56 sm:h-72 flex-shrink-0 overflow-hidden bg-gray-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-blue" />
        )}
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

      {/* Content — grows to fill card height */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <h3 className="font-black text-brand-navy text-xl sm:text-2xl leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
          {article.title}
        </h3>
        {excerpt && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        )}
        {article.body && (
          <p className="mt-3 text-sm text-gray-400 line-clamp-4 leading-relaxed">
            {article.body.includes('<') ? stripHtml(article.body) : article.body}
          </p>
        )}

        <hr className='mt-4' />
        {/* Author row always pinned to bottom */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-4">
          <AuthorRow article={article} compact={false} />
        </div>
      </div>
    </Link>
  );
}

/** Stacked card — right column, fills its flex-1 slot */
function SideCard({ article }: { article: ArticleCardData }) {
  const imageUrl = article.coverImageUrl || article.featuredImageUrl;
  const readMinutes = article.readTime || article.readTimeMinutes;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-brand-navy hover:border-brand-gold/40 hover:shadow-card-hover transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-32 flex-shrink-0 overflow-hidden bg-gray-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-navy to-brand-blue" />
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
          {article.category?.name && (
            <span className="inline-flex items-center rounded-full bg-brand-navy/75 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              {article.category.name}
            </span>
          )}
          {readMinutes && (
            <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-white/85 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-semibold text-brand-navy">
              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readMinutes} min
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        <h3 className="font-bold text-brand-navy text-sm leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors flex-1">
          {article.title}

        </h3>
        {article.excerpt && (

          <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
            {article.excerpt}
          </p>
        )}
        <hr></hr>
        <div className="mt-3">
          <AuthorRow article={article} compact />
        </div>
      </div>
    </Link>
  );
}

/** Small equal-width card — bottom grid row */
function GridCard({ article }: { article: ArticleCardData }) {
  const imageUrl = article.coverImageUrl || article.featuredImageUrl;
  const readMinutes = article.readTime || article.readTimeMinutes;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block bg-white rounded-2xl border border-brand-navy hover:border-brand-gold/40 hover:shadow-card-hover transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-navy to-brand-blue" />
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          {article.category?.name && (
            <span className="inline-flex items-center rounded-full bg-brand-navy/75 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              {article.category.name}
            </span>
          )}
          {readMinutes && (
            <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-white/85 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-semibold text-brand-navy">
              {readMinutes} min
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-brand-navy text-sm leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className=" text-xs text-gray-500 line-clamp-2 leading-relaxed mt-4 mb-4">
            {article.excerpt.includes('<') ? stripHtml(article.excerpt) : article.excerpt}
          </p>
        )}

        <hr></hr>
        <div className="flex items-center justify-between gap-2 pt-2">
          <AuthorRow article={article} compact />
        </div>
      </div>
    </Link>
  );
}

export default function LatestArticlesSection({ articles }: LatestArticlesSectionProps) {
  const featured = articles[0];
  const sideArticles = articles.slice(1, 3);
  const bottomArticles = articles.slice(3, 6);

  return (
    <section className="py-20 bg-brand-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">
              Knowledge Base
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Latest Articles
            </h2>
          </div>
          <Link
            href="/articles"
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white border border-white/20 rounded-lg px-4 py-2 hover:border-white hover:bg-white hover:text-brand-navy transition-all duration-200 flex-shrink-0"
          >
            View All
            <svg className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-2xl bg-white/5 border border-white/10 py-16 text-center">
            <p className="text-sm text-white/50">No articles published yet.</p>
          </div>
        ) : (
          <>
            {/* ── Mobile layout ── */}
            <div className="lg:hidden space-y-0">
              {/* Featured article — full width */}
              {featured && (
                <div className="mb-4">
                  <FeaturedCard article={featured} />
                </div>
              )}

              {/* Remaining articles — horizontal snap-scroll */}
              {articles.length > 1 && (
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-2">
                  {articles.slice(1, 6).map((article) => (
                    <div key={article.id} className="snap-start flex-shrink-0 w-[78vw] max-w-[280px]">
                      <GridCard article={article} />
                    </div>
                  ))}
                  <div className="flex-shrink-0 w-4" aria-hidden />
                </div>
              )}
            </div>

            {/* ── Desktop layout ── */}
            <div className="hidden lg:block">
              {/* Top row: featured (2/3) + 2 stacked side cards (1/3) */}
              <div className="grid grid-cols-3 gap-5">
                {featured && (
                  <div className="col-span-2">
                    <FeaturedCard article={featured} />
                  </div>
                )}
                {sideArticles.length > 0 && (
                  <div className="flex flex-col gap-4 h-full">
                    {sideArticles.map((article) => (
                      <div key={article.id} className="flex-1 min-h-[180px]">
                        <SideCard article={article} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom row: 3 equal cards */}
              {bottomArticles.length > 0 && (
                <div className="grid grid-cols-3 gap-5 mt-5">
                  {bottomArticles.map((article) => (
                    <GridCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </section>
  );
}
