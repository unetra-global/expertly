'use client';

import Link from 'next/link';
import { PenLine, UserCircle, ExternalLink, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import type { DashboardStats, ConsultationRequest, MemberArticle } from '@/types/api';

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ── Circular Progress ────────────────────────────────────────────────────────

function CircularProgress({ value }: { value: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <svg className="-rotate-90" width="64" height="64">
        <circle cx="32" cy="32" r={r} stroke="#E2E8F0" strokeWidth="6" fill="none" />
        <circle
          cx="32" cy="32" r={r}
          stroke="#2563EB" strokeWidth="6" fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-brand-text">{pct}%</span>
    </div>
  );
}

// ── Status badge colours for articles ────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  archived: 'bg-slate-100 text-slate-500',
};

function ArticleStatusBadge({ status }: { status: string }) {
  const label = status.replace('_', ' ');
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {label}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

interface Props { stats: DashboardStats }

export default function DashboardStats({ stats }: Props) {
  const expiryDays = daysUntil(stats.membershipExpiryAt);
  const expiryIsUrgent = expiryDays !== null && expiryDays < 30;

  const statCards = [
    {
      label: 'Profile Completion',
      content: <CircularProgress value={stats.profileCompletion} />,
      sub: `${stats.profileCompletion}% complete`,
    },
    {
      label: 'Published Articles',
      content: <span className="text-4xl font-bold text-brand-text">{stats.publishedArticlesCount}</span>,
      sub: 'articles live',
    },
    {
      label: 'Total Views',
      content: <span className="text-4xl font-bold text-brand-text">{stats.totalArticleViews.toLocaleString()}</span>,
      sub: 'all-time article views',
    },
    {
      label: 'Consultation Requests',
      content: <span className="text-4xl font-bold text-brand-text">{stats.consultationRequestsCount}</span>,
      sub: 'in the last 30 days',
    },
    {
      label: 'Membership Expiry',
      content: (
        <span className={`text-2xl font-semibold ${expiryIsUrgent ? 'text-red-600' : 'text-brand-text'}`}>
          {formatDate(stats.membershipExpiryAt)}
        </span>
      ),
      sub: expiryIsUrgent
        ? `Expires in ${expiryDays} days — renew soon`
        : 'Membership active',
      urgentSub: expiryIsUrgent,
    },
    {
      label: 'Verified Status',
      content: stats.isVerified ? (
        <CheckCircle className="w-10 h-10 text-green-500" />
      ) : stats.isVerifiedPending ? (
        <Clock className="w-10 h-10 text-amber-500" />
      ) : (
        <AlertTriangle className="w-10 h-10 text-slate-400" />
      ),
      sub: stats.isVerified
        ? 'Verified badge awarded'
        : stats.isVerifiedPending
          ? 'Verified badge pending re-review'
          : 'Not yet verified',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-text">My Dashboard</h1>
        <p className="text-brand-text-secondary mt-1 text-sm">
          Welcome back — here&apos;s your overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-card p-6 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-text-muted">
              {card.label}
            </p>
            <div className="flex items-center">{card.content}</div>
            <p className={`text-sm ${card.urgentSub ? 'text-red-600 font-medium' : 'text-brand-text-secondary'}`}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link
          href="/member/articles/new"
          className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue-dark transition-colors"
        >
          <PenLine className="w-4 h-4" />
          Write Article
        </Link>
        <Link
          href="/member/profile"
          className="inline-flex items-center gap-2 bg-white border border-slate-200 text-brand-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-surface-alt transition-colors"
        >
          <UserCircle className="w-4 h-4" />
          Edit Profile
        </Link>
        {stats.memberSlug && (
          <Link
            href={`/members/${stats.memberSlug}`}
            target="_blank"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-brand-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-surface-alt transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Public Profile
          </Link>
        )}
      </div>

      {/* Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Consultation Requests */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-base font-semibold text-brand-text mb-4">Recent Consultation Requests</h2>
          {stats.recentConsultationRequests.length === 0 ? (
            <p className="text-sm text-brand-text-muted py-6 text-center">No consultation requests yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentConsultationRequests.slice(0, 3).map((req: ConsultationRequest) => (
                <li key={req.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-brand-surface">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-text truncate">{req.subject}</p>
                    <p className="text-xs text-brand-text-muted mt-0.5">
                      {req.requesterName ?? 'Anonymous'} · {formatDate(req.createdAt)}
                    </p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    req.status === 'pending' ? 'bg-amber-100 text-amber-700'
                    : req.status === 'accepted' ? 'bg-green-100 text-green-700'
                    : req.status === 'declined' ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600'
                  }`}>
                    {req.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-brand-text">Recent Articles</h2>
            <Link href="/member/articles" className="text-sm text-brand-blue hover:underline">
              View all
            </Link>
          </div>
          {stats.recentArticles.length === 0 ? (
            <p className="text-sm text-brand-text-muted py-6 text-center">No articles yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentArticles.slice(0, 3).map((article: MemberArticle) => (
                <li key={article.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-brand-surface">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-text truncate">
                      {article.title ?? 'Untitled draft'}
                    </p>
                    <p className="text-xs text-brand-text-muted mt-0.5">
                      {formatDate(article.updatedAt)}
                    </p>
                  </div>
                  <ArticleStatusBadge status={article.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
