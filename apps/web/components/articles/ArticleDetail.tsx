'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ArticleFull } from '@/types/api';

interface ArticleDetailProps {
  article: ArticleFull;
  related: ArticleFull[];
  moreByAuthor: ArticleFull[];
}

function formatDate(dateStr: string, short = false) {
  return new Intl.DateTimeFormat('en-GB', short
    ? { day: 'numeric', month: 'short', year: 'numeric' }
    : { day: 'numeric', month: 'short', year: 'numeric' }
  ).format(new Date(dateStr));
}

function SidebarArticleList({ articles }: { articles: ArticleFull[] }) {
  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {articles.map((a) => (
        <Link key={a.id} href={`/articles/${a.slug}`} className="py-3 first:pt-0 last:pb-0 group">
          {a.category && (
            <p className="text-[10px] font-semibold text-brand-blue uppercase tracking-wide mb-1">
              {a.category.name}
            </p>
          )}
          <p className="text-xs font-semibold text-brand-navy leading-snug group-hover:text-brand-blue transition-colors line-clamp-2">
            {a.title}
          </p>
          <p className="text-[10px] text-brand-text-muted mt-1">
            {a.publishedAt && formatDate(a.publishedAt, true)}
            {a.readTimeMinutes && ` · ${a.readTimeMinutes} min read`}
          </p>
        </Link>
      ))}
    </div>
  );
}

export function ArticleDetail({ article, related, moreByAuthor }: ArticleDetailProps) {
  const [helpful, setHelpful] = useState(false);
  const [saved, setSaved] = useState(false);

  const authorName =
    article.author?.user.fullName ||
    [article.author?.user.firstName, article.author?.user.lastName].filter(Boolean).join(' ') ||
    'Expertly Author';
  const authorInitials = authorName[0] ?? 'E';

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = encodeURIComponent(article.title);

  return (
    <>
      {/* Featured image */}
      {article.featuredImageUrl && (
        <div className="w-full h-64 sm:h-80 overflow-hidden bg-brand-navy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.featuredImageUrl} alt={article.title} className="w-full h-full object-cover opacity-90" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-12 items-start">

          {/* ── Main column ─────────────────────────────────── */}
          <article className="flex-1 min-w-0">

            {/* ── Top meta bar ── */}
            <div className="mb-6">
              <Link
                href="/articles"
                className="inline-flex items-center gap-1.5 text-xs text-brand-text-muted hover:text-brand-blue transition-colors mb-5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Knowledge Hub
              </Link>

              <div className="flex flex-wrap items-center gap-3 text-xs text-brand-text-muted">
                {article.category && (
                  <span className="inline-flex items-center rounded-full bg-brand-blue-subtle border border-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-brand-blue uppercase tracking-wide">
                    {article.category.name}
                  </span>
                )}
                {article.publishedAt && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(article.publishedAt)}
                  </span>
                )}
                {article.readTimeMinutes && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {article.readTimeMinutes} min read
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-navy leading-tight mb-4">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-lg text-brand-text-secondary leading-relaxed mb-6">{article.subtitle}</p>
            )}

            {/* Byline */}
            {article.author && (
              <div className="flex items-center gap-3 py-4 border-y border-gray-100 mb-8">
                <Link href={`/members/${article.author.slug}`} className="flex-shrink-0">
                  {article.author.profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.author.profilePhotoUrl} alt={authorName} className="w-9 h-9 rounded-full object-cover border border-gray-100" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-brand-navy flex items-center justify-center text-white font-semibold text-sm">
                      {authorInitials}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/members/${article.author.slug}`} className="font-semibold text-brand-navy text-sm hover:text-brand-blue transition-colors">
                    {authorName}
                  </Link>
                  {article.author.designation && (
                    <p className="text-xs text-brand-text-muted">{article.author.designation}</p>
                  )}
                </div>
              </div>
            )}

            {/* Body */}
            <div
              className="prose prose-sm sm:prose max-w-none
                prose-headings:text-brand-navy prose-headings:font-bold
                prose-p:text-brand-text-secondary prose-p:leading-relaxed
                prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
                prose-strong:text-brand-navy
                prose-blockquote:border-brand-blue prose-blockquote:text-brand-text-secondary
                prose-code:bg-gray-50 prose-code:text-brand-navy prose-code:rounded prose-code:px-1
                prose-ul:text-brand-text-secondary prose-ol:text-brand-text-secondary"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />

            {/* Tags */}
            {(article.tags ?? []).length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
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

            {/* ── Bottom action bar ── */}
            <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setHelpful((v) => !v)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${helpful ? 'text-brand-blue' : 'text-brand-text-muted hover:text-brand-navy'}`}
                >
                  <svg className="w-4 h-4" fill={helpful ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Helpful
                </button>
                <button
                  onClick={() => setSaved((v) => !v)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${saved ? 'text-brand-blue' : 'text-brand-text-muted hover:text-brand-navy'}`}
                >
                  <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save for later
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-brand-text-muted">
                <span className="hidden sm:inline">Share this insight:</span>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-md bg-[#0A66C2] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-md bg-black flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                  aria-label="Share on X"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

          </article>

          {/* ── Sidebar ─────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-5 w-72 xl:w-80 flex-shrink-0 sticky top-8 self-start">

            {/* About the Author */}
            {article.author && (
              <div className="rounded-2xl border border-gray-100 bg-white shadow-card p-5">
                <p className="text-[10px] font-semibold text-brand-text-muted uppercase tracking-wider mb-4">About the Author</p>
                <div className="flex flex-col items-center text-center gap-3">
                  {article.author.profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.author.profilePhotoUrl} alt={authorName} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-xl">
                      {authorInitials}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-brand-navy text-sm">{authorName}</p>
                    {article.author.designation && (
                      <p className="text-xs text-brand-blue mt-0.5">{article.author.designation}</p>
                    )}
                    {article.author.headline && (
                      <p className="text-xs text-brand-text-muted mt-2 leading-relaxed line-clamp-3">{article.author.headline}</p>
                    )}
                  </div>
                  <Link
                    href={`/members/${article.author.slug}`}
                    className="w-full text-center rounded-lg bg-brand-blue text-white text-xs font-semibold py-2.5 hover:bg-brand-blue-dark transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )}

            {/* More from Author */}
            {moreByAuthor.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white shadow-card p-5">
                <p className="text-[10px] font-semibold text-brand-text-muted uppercase tracking-wider mb-4">
                  More from {authorName.split(' ')[0]}
                </p>
                <SidebarArticleList articles={moreByAuthor} />
              </div>
            )}

            {/* Related Articles */}
            {related.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white shadow-card p-5">
                <p className="text-[10px] font-semibold text-brand-text-muted uppercase tracking-wider mb-4">Related Articles</p>
                <SidebarArticleList articles={related.slice(0, 4)} />
              </div>
            )}

            {/* Subscribe CTA */}
            <div className="rounded-2xl bg-brand-navy p-5 text-center">
              <p className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider mb-2">★ Subscribe Now</p>
              <p className="text-sm font-bold text-white mb-1">Enjoying this analysis?</p>
              <p className="text-xs text-white/60 leading-relaxed mb-4">
                Subscribe to regular updates on financial and legal aspects across the world.
              </p>
              <Link
                href="/auth"
                className="block w-full text-center rounded-lg bg-white text-brand-navy text-xs font-semibold py-2.5 hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </Link>
            </div>

          </aside>
        </div>
      </div>
    </>
  );
}
