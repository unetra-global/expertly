'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ArticleFull } from '@/types/api';

const MEMBER_TIER_LABELS: Record<string, string> = {
  budding_entrepreneur: 'Budding Entrepreneur',
  seasoned_professional: 'Seasoned Professional',
};

const MEMBER_TIER_SHORT: Record<string, string> = {
  budding_entrepreneur: 'BE',
  seasoned_professional: 'SP',
};

/** Defensive fallback: convert ISO-2 codes to full country names (cache may lag migration 041) */
const ISO2_TO_COUNTRY: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AO: 'Angola', AR: 'Argentina',
  AM: 'Armenia', AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan', BH: 'Bahrain',
  BD: 'Bangladesh', BE: 'Belgium', BO: 'Bolivia', BA: 'Bosnia and Herzegovina',
  BW: 'Botswana', BR: 'Brazil', BN: 'Brunei', BG: 'Bulgaria', KH: 'Cambodia',
  CM: 'Cameroon', CA: 'Canada', CL: 'Chile', CN: 'China', CO: 'Colombia',
  CR: 'Costa Rica', HR: 'Croatia', CY: 'Cyprus', CZ: 'Czech Republic', DK: 'Denmark',
  DO: 'Dominican Republic', EC: 'Ecuador', EG: 'Egypt', EE: 'Estonia', ET: 'Ethiopia',
  FI: 'Finland', FJ: 'Fiji', FR: 'France', GE: 'Georgia', DE: 'Germany',
  GH: 'Ghana', GR: 'Greece', GT: 'Guatemala', HK: 'Hong Kong', HU: 'Hungary',
  IS: 'Iceland', IN: 'India', ID: 'Indonesia', IR: 'Iran', IQ: 'Iraq',
  IE: 'Ireland', IL: 'Israel', IT: 'Italy', JM: 'Jamaica', JP: 'Japan',
  JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KW: 'Kuwait', KG: 'Kyrgyzstan',
  LV: 'Latvia', LB: 'Lebanon', LY: 'Libya', LT: 'Lithuania', LU: 'Luxembourg',
  MG: 'Madagascar', MY: 'Malaysia', MV: 'Maldives', MT: 'Malta', MR: 'Mauritius',
  MX: 'Mexico', MD: 'Moldova', MN: 'Mongolia', ME: 'Montenegro', MA: 'Morocco',
  MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia', NP: 'Nepal', NL: 'Netherlands',
  NZ: 'New Zealand', NG: 'Nigeria', MK: 'North Macedonia', NO: 'Norway', OM: 'Oman',
  PK: 'Pakistan', PA: 'Panama', PY: 'Paraguay', PE: 'Peru', PH: 'Philippines',
  PL: 'Poland', PT: 'Portugal', QA: 'Qatar', RO: 'Romania', RU: 'Russia',
  RW: 'Rwanda', SA: 'Saudi Arabia', SN: 'Senegal', RS: 'Serbia', SG: 'Singapore',
  SK: 'Slovakia', SI: 'Slovenia', ZA: 'South Africa', KR: 'South Korea', ES: 'Spain',
  LK: 'Sri Lanka', SE: 'Sweden', CH: 'Switzerland', TW: 'Taiwan', TJ: 'Tajikistan',
  TZ: 'Tanzania', TH: 'Thailand', TT: 'Trinidad and Tobago', TN: 'Tunisia',
  TR: 'Turkey', TM: 'Turkmenistan', UG: 'Uganda', UA: 'Ukraine',
  AE: 'United Arab Emirates', GB: 'United Kingdom', US: 'United States',
  UY: 'Uruguay', UZ: 'Uzbekistan', VE: 'Venezuela', VN: 'Vietnam', ZM: 'Zambia', ZW: 'Zimbabwe',
};

function resolveCountry(val?: string): string | undefined {
  if (!val) return undefined;
  if (val.length === 2) return ISO2_TO_COUNTRY[val.toUpperCase()] ?? val;
  return val;
}

interface ArticleDetailProps {
  article: ArticleFull;
  related: ArticleFull[];
  moreByAuthor: ArticleFull[];
  isGuest?: boolean;
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
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
            {a.publishedAt && formatDate(a.publishedAt)}
            {a.readTimeMinutes && ` · ${a.readTimeMinutes} min read`}
          </p>
        </Link>
      ))}
    </div>
  );
}

function AuthorCard({
  article,
  authorName,
  authorInitials,
}: {
  article: ArticleFull;
  authorName: string;
  authorInitials: string;
}) {
  if (!article.author) return null;

  const tierShort = article.author.memberTier
    ? MEMBER_TIER_SHORT[article.author.memberTier] ?? null
    : null;
  const location = [article.author.city, resolveCountry(article.author.country)].filter(Boolean).join(', ');

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-card p-5">
      <p className="text-[10px] font-semibold text-brand-text-muted uppercase tracking-wider mb-4">
        About the Author
      </p>
      <div className="flex flex-col items-center text-center gap-3">
        {article.author.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.author.profilePhotoUrl}
            alt={authorName}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-xl">
            {authorInitials}
          </div>
        )}

        <div className="w-full">
          <div className="flex items-center justify-center gap-1.5">
            <p className="font-bold text-brand-navy text-sm">{authorName}</p>
            {tierShort && (
              <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 leading-none">
                {tierShort}
              </span>
            )}
          </div>

          {article.author.designation && (
            <p className="text-xs text-brand-blue mt-0.5">{article.author.designation}</p>
          )}

          {article.author.primaryService?.name && (
            <p className="text-xs text-brand-text-muted mt-0.5">
              {article.author.primaryService.name}
            </p>
          )}

          {location && (
            <p className="flex items-center justify-center gap-1 text-[11px] text-brand-text-muted mt-2">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </p>
          )}

          {article.author.headline && (
            <p className="text-xs text-brand-text-muted mt-2 leading-relaxed line-clamp-3">
              {article.author.headline}
            </p>
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
  );
}

/** Compact author strip shown on mobile between title and body */
function MobileAuthorStrip({
  article,
  authorName,
  authorInitials,
}: {
  article: ArticleFull;
  authorName: string;
  authorInitials: string;
}) {
  if (!article.author) return null;

  const tierShort = article.author.memberTier
    ? MEMBER_TIER_SHORT[article.author.memberTier] ?? null
    : null;
  const location = [article.author.city, resolveCountry(article.author.country)].filter(Boolean).join(', ');

  return (
    <div className="flex items-center gap-3 py-4 border-y border-gray-100 mb-6 lg:hidden">
      <Link href={`/members/${article.author.slug}`} className="flex-shrink-0">
        {article.author.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.author.profilePhotoUrl}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover border border-gray-100"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-semibold text-sm">
            {authorInitials}
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/members/${article.author.slug}`}
            className="font-semibold text-brand-navy text-sm hover:text-brand-blue transition-colors"
          >
            {authorName}
          </Link>
          {tierShort && (
            <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 leading-none">
              {tierShort}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {article.author.designation && (
            <span className="text-xs text-brand-text-muted">{article.author.designation}</span>
          )}
          {article.author.primaryService?.name && (
            <>
              <span className="text-brand-text-muted text-xs">·</span>
              <span className="text-xs text-brand-text-muted">{article.author.primaryService.name}</span>
            </>
          )}
          {location && (
            <>
              <span className="text-brand-text-muted text-xs">·</span>
              <span className="text-[11px] text-brand-text-muted">{location}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Soft gate shown to guest readers — fades out content and prompts sign-in */
function GuestGate({ articleSlug }: { articleSlug: string }) {
  return (
    <div className="relative -mt-16">
      {/* Fade overlay */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      {/* Sign-in card */}
      <div className="relative bg-white border border-gray-100 rounded-2xl shadow-card mx-auto max-w-md p-8 text-center mt-8">
        <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-brand-navy mb-2">Continue reading</h3>
        <p className="text-sm text-brand-text-muted mb-6 leading-relaxed">
          Sign in to read the full article and access expert insights from verified finance and legal professionals.
        </p>
        <Link
          href={`/auth?returnTo=/articles/${articleSlug}`}
          className="block w-full rounded-xl bg-brand-navy text-white text-sm font-semibold py-3 hover:bg-brand-navy/90 transition-colors mb-3"
        >
          Sign in to read
        </Link>
        <Link
          href={`/auth?tab=signup&returnTo=/articles/${articleSlug}`}
          className="block w-full rounded-xl border border-gray-200 text-brand-navy text-sm font-semibold py-3 hover:bg-brand-surface transition-colors"
        >
          Create a free account
        </Link>
      </div>
    </div>
  );
}

export function ArticleDetail({
  article,
  related,
  moreByAuthor,
  isGuest = false,
}: ArticleDetailProps) {
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const authorName =
    article.author?.user.fullName ||
    [article.author?.user.firstName, article.author?.user.lastName].filter(Boolean).join(' ') ||
    'Expertly Author';
  const authorInitials = authorName[0]?.toUpperCase() ?? 'E';

  const shareTitle = encodeURIComponent(article.title);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedSummary = encodeURIComponent(article.aiSummary ?? article.excerpt ?? '');

  // For guests: show first ~300 words then gate
  const guestBody = (() => {
    if (!isGuest) return article.body;
    // Strip to text, count ~300 words, then find nearest closing tag
    const stripped = article.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const words = stripped.trim().split(' ');
    if (words.length <= 80) return article.body; // short article — show all
    // Find cut point by character count (~300 words ≈ 1500 chars)
    const cutChar = 1500;
    let charCount = 0;
    let tagOpen = false;
    let cutIndex = 0;
    for (let i = 0; i < article.body.length; i++) {
      if (article.body[i] === '<') { tagOpen = true; }
      if (!tagOpen) charCount++;
      if (article.body[i] === '>') { tagOpen = false; }
      if (charCount >= cutChar) { cutIndex = i + 1; break; }
    }
    // Find next closing tag after cutIndex
    const closingTagIdx = article.body.indexOf('>', cutIndex);
    return article.body.slice(0, closingTagIdx !== -1 ? closingTagIdx + 1 : cutIndex);
  })();

  return (
    <>
      {/* ── Back nav — above hero on clean background ────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-text-muted hover:text-brand-blue transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Knowledge Hub
        </Link>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-brand-navy" style={{ minHeight: '200px' }}>
        {article.featuredImageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.featuredImageUrl}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-brand-navy/70 to-brand-navy/90" />
          </>
        ) : (
          /* Decorative gradient pattern when no image */
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-[#1e3a5f] to-[#0d2240]">
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, #c9a84c 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 40%)',
              }}
            />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {article.category && (
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white uppercase tracking-wide">
                {article.category.name}
              </span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-3xl">
            {article.title}
          </h1>
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-10 items-start">

          {/* ── Main column ────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Article card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">

              {/* Article meta: date + read time */}
              {(article.publishedAt || article.readTimeMinutes) && (
                <div className="flex items-center gap-3 mb-5">
                  {article.publishedAt && (
                    <span className="text-xs text-brand-text-muted">{formatDate(article.publishedAt)}</span>
                  )}
                  {article.publishedAt && article.readTimeMinutes && (
                    <span className="text-brand-text-muted text-xs">·</span>
                  )}
                  {article.readTimeMinutes && (
                    <span className="text-xs text-brand-text-muted">{article.readTimeMinutes} min read</span>
                  )}
                </div>
              )}

              {/* Subtitle */}
              {article.subtitle && (
                <p className="text-lg text-brand-text-secondary leading-relaxed mb-5">
                  {article.subtitle}
                </p>
              )}

              {/* AI summary block */}
              {article.aiSummary && (
                <div className="flex gap-3 bg-brand-blue-subtle border border-blue-100 rounded-xl p-4 mb-6">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-blue/15 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-brand-blue uppercase tracking-wider mb-1">
                      AI Summary
                    </p>
                    <p className="text-sm text-brand-text-secondary leading-relaxed">
                      {article.aiSummary}
                    </p>
                  </div>
                </div>
              )}

              {/* Mobile author strip — between title area and body */}
              <MobileAuthorStrip
                article={article}
                authorName={authorName}
                authorInitials={authorInitials}
              />

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
                dangerouslySetInnerHTML={{ __html: guestBody }}
              />

              {/* Guest gate */}
              {isGuest && <GuestGate articleSlug={article.slug} />}

              {/* Tags */}
              {!isGuest && (article.tags ?? []).length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-brand-text-muted uppercase tracking-wider mb-3">
                    Tagged
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(article.tags ?? []).map((tag) => (
                      <Link
                        key={tag}
                        href={`/articles?tag=${encodeURIComponent(tag)}`}
                        className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-medium text-brand-text-secondary hover:border-brand-blue/30 hover:text-brand-blue hover:bg-brand-blue-subtle transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share bar */}
              {!isGuest && shareUrl && (
                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">
                    Share this insight
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${shareTitle}&summary=${encodedSummary}&source=Expertly`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                      aria-label="Share on LinkedIn"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodedUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:opacity-80 transition-opacity"
                      aria-label="Share on X"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-5 w-72 xl:w-80 flex-shrink-0 sticky top-8 self-start">

            <AuthorCard
              article={article}
              authorName={authorName}
              authorInitials={authorInitials}
            />

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
                <p className="text-[10px] font-semibold text-brand-text-muted uppercase tracking-wider mb-4">
                  Related Articles
                </p>
                <SidebarArticleList articles={related.slice(0, 4)} />
              </div>
            )}

            {/* Subscribe CTA */}
            <div className="rounded-2xl bg-brand-navy p-5 text-center">
              <p className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider mb-2">
                ★ Subscribe Now
              </p>
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
