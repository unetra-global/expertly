import Link from 'next/link';
import type { ArticleFull } from '@/types/api';

interface ArticleDetailProps {
  article: ArticleFull;
  related: ArticleFull[];
}

export function ArticleDetail({ article, related }: ArticleDetailProps) {
  const authorName =
    article.author?.user.fullName ||
    [article.author?.user.firstName, article.author?.user.lastName].filter(Boolean).join(' ') ||
    'Expertly Author';

  const authorInitials = authorName[0] ?? 'E';

  const publishedDate = article.publishedAt
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(article.publishedAt))
    : null;

  return (
    <>
      {/* Featured image — full width */}
      {article.featuredImageUrl && (
        <div className="w-full h-64 sm:h-80 lg:h-96 overflow-hidden bg-brand-navy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.featuredImageUrl}
            alt={article.title}
            className="w-full h-full object-cover opacity-90"
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Article header */}
        <header className="mb-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-brand-text-muted mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-brand-blue transition-colors">Articles</Link>
            {article.serviceCategory && (
              <>
                <span>/</span>
                <Link
                  href="/articles"
                  className="hover:text-brand-blue transition-colors"
                >
                  {article.serviceCategory.name}
                </Link>
              </>
            )}
          </nav>

          {/* Category pill */}
          {article.serviceCategory && (
            <span className="inline-flex items-center rounded-full bg-brand-blue-subtle border border-blue-100 px-3 py-1 text-xs font-medium text-brand-blue mb-4">
              {article.serviceCategory.name}
            </span>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-navy leading-tight mb-3">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-lg text-brand-text-secondary leading-relaxed mb-5">
              {article.subtitle}
            </p>
          )}

          {/* Byline */}
          <div className="flex items-center gap-3 py-4 border-y border-gray-100">
            {/* Author avatar */}
            {article.author ? (
              <Link href={`/members/${article.author.slug}`} className="flex-shrink-0">
                {article.author.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.author.profilePhotoUrl}
                    alt={authorName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-100 hover:border-brand-blue/30 transition-colors"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-semibold text-sm">
                    {authorInitials}
                  </div>
                )}
              </Link>
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {authorInitials}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {article.author ? (
                <Link href={`/members/${article.author.slug}`} className="font-semibold text-brand-navy text-sm hover:text-brand-blue transition-colors">
                  {authorName}
                </Link>
              ) : (
                <p className="font-semibold text-brand-navy text-sm">{authorName}</p>
              )}
              {article.author?.designation && (
                <p className="text-xs text-brand-text-muted">{article.author.designation}</p>
              )}
            </div>

            <div className="flex-shrink-0 text-right text-xs text-brand-text-muted space-y-0.5">
              {publishedDate && <p>{publishedDate}</p>}
              {article.readTimeMinutes && <p>{article.readTimeMinutes} min read</p>}
            </div>
          </div>
        </header>

        {/* Article body */}
        <div
          className="prose prose-sm sm:prose max-w-none
            prose-headings:text-brand-navy prose-headings:font-bold
            prose-p:text-brand-text-secondary prose-p:leading-relaxed
            prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
            prose-strong:text-brand-navy
            prose-blockquote:border-brand-blue prose-blockquote:text-brand-text-secondary
            prose-code:bg-gray-50 prose-code:text-brand-navy prose-code:rounded prose-code:px-1
            prose-ul:text-brand-text-secondary prose-ol:text-brand-text-secondary"
          // The article body is pre-sanitized by the API before storage (sanitize-html)
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* Tags */}
        {(article.tags ?? []).length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {(article.tags ?? []).map((tag) => (
                <Link
                  key={tag}
                  href={`/articles?q=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-medium text-brand-text-secondary hover:border-brand-blue/30 hover:text-brand-blue transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author card */}
        {article.author && (
          <div className="mt-10 rounded-2xl bg-brand-surface border border-gray-100 p-6 flex flex-col sm:flex-row gap-4 items-start">
            {article.author.profilePhotoUrl ? (
              <Link href={`/members/${article.author.slug}`} className="flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.author.profilePhotoUrl}
                  alt={authorName}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                />
              </Link>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-brand-navy flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {authorInitials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider mb-1">Written by</p>
              <Link href={`/members/${article.author.slug}`} className="font-bold text-brand-navy text-base hover:text-brand-blue transition-colors">
                {authorName}
              </Link>
              {article.author.designation && (
                <p className="text-sm text-brand-text-secondary mt-0.5">{article.author.designation}</p>
              )}
              {article.author.headline && (
                <p className="text-xs text-brand-text-muted mt-1 leading-relaxed line-clamp-2">{article.author.headline}</p>
              )}
            </div>
            <div className="flex-shrink-0">
              <Link
                href={`/members/${article.author.slug}`}
                className="inline-flex items-center gap-1.5 btn-outline text-sm"
              >
                View profile
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* CTA — guest prompt */}
        <div className="mt-8 rounded-2xl bg-brand-navy p-6 sm:p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">
            Want to connect with this expert?
          </h3>
          <p className="text-white/60 text-sm mb-5">
            Sign in to send a consultation request or browse the full member directory.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/auth" className="btn-primary-dark px-6">Sign In</Link>
            <Link href="/members" className="btn-outline-white px-6">Browse Experts</Link>
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-brand-navy mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => {
                const relAuthorName =
                  rel.author?.user.fullName ||
                  [rel.author?.user.firstName, rel.author?.user.lastName].filter(Boolean).join(' ') ||
                  'Author';
                const relDate = rel.publishedAt
                  ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(rel.publishedAt))
                  : null;

                return (
                  <Link
                    key={rel.id}
                    href={`/articles/${rel.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden"
                  >
                    <div className="aspect-[16/9] bg-brand-surface overflow-hidden">
                      {rel.featuredImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rel.featuredImageUrl} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-navy to-brand-navy-light" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-brand-navy text-sm leading-snug group-hover:text-brand-blue transition-colors line-clamp-2 mb-2">
                        {rel.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-brand-text-muted">
                        <span className="truncate">{relAuthorName}</span>
                        {relDate && <><span>·</span><span className="flex-shrink-0">{relDate}</span></>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
