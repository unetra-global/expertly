'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { PenLine, Eye, Trash2, Send, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { MemberArticle, ArticleStatus } from '@/types/api';

// ── Status Styles ─────────────────────────────────────────────────────────────

const STATUS_META: Record<ArticleStatus, { label: string; cls: string }> = {
  draft:        { label: 'Draft',        cls: 'bg-slate-100 text-slate-600' },
  submitted:    { label: 'Submitted',    cls: 'bg-blue-100 text-blue-700' },
  under_review: { label: 'Under Review', cls: 'bg-amber-100 text-amber-700' },
  published:    { label: 'Published',    cls: 'bg-green-100 text-green-700' },
  rejected:     { label: 'Rejected',     cls: 'bg-red-100 text-red-700' },
  archived:     { label: 'Archived',     cls: 'bg-slate-100 text-slate-500' },
};

function StatusBadge({ status }: { status: ArticleStatus }) {
  const meta = STATUS_META[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ArticlesPage() {
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.articles.mine(),
    queryFn: () => apiClient.get<MemberArticle[]>('/articles/member/me'),
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/articles/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.articles.mine() });
    },
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/articles/${id}/submit`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.articles.mine() });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-8 w-40 bg-slate-200 rounded animate-pulse mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-card h-24 animate-pulse mb-4" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">Unable to load articles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">My Articles</h1>
          <p className="text-sm text-brand-text-secondary mt-1">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/member/articles/new"
          className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue-dark transition-colors"
        >
          <PenLine className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Empty state */}
      {articles.length === 0 && (
        <div className="bg-white rounded-xl shadow-card p-12 text-center">
          <PenLine className="w-10 h-10 text-brand-text-muted mx-auto mb-3" />
          <h3 className="text-base font-semibold text-brand-text mb-1">No articles yet</h3>
          <p className="text-sm text-brand-text-secondary mb-4">Share your expertise with the Expertly community.</p>
          <Link
            href="/member/articles/new"
            className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue-dark transition-colors"
          >
            <PenLine className="w-4 h-4" />
            Write your first article
          </Link>
        </div>
      )}

      {/* Article list */}
      {articles.length > 0 && (
        <ul className="space-y-4">
          {articles.map((article) => {
            const canEdit = article.status === 'draft' || article.status === 'published' || article.status === 'rejected';
            const canSubmit = article.status === 'draft' && (article.wordCount ?? 0) >= 300 && !!article.featuredImageUrl;
            const canDelete = article.status === 'draft';
            const viewPublicSlug = article.status === 'published' ? article.slug : null;
            const viewOnly = article.status === 'submitted' || article.status === 'under_review' || article.status === 'archived';

            return (
              <li key={article.id} className="bg-white rounded-xl shadow-card p-5">
                <div className="flex items-start justify-between gap-4">
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <StatusBadge status={article.status} />
                      <span className="text-xs text-brand-text-muted">{formatDate(article.updatedAt)}</span>
                    </div>
                    <h3 className="text-base font-semibold text-brand-text truncate">
                      {article.title ?? 'Untitled draft'}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-brand-text-secondary line-clamp-1 mt-0.5">{article.excerpt}</p>
                    )}
                    {article.status === 'rejected' && article.rejectionReason && (
                      <div className="flex items-start gap-2 mt-2 p-2.5 bg-red-50 rounded-lg border border-red-100">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700">{article.rejectionReason}</p>
                      </div>
                    )}
                    {article.status === 'draft' && (article.wordCount ?? 0) < 300 && (
                      <p className="text-xs text-amber-600 mt-1.5">
                        {article.wordCount ?? 0}/300 words — needs {300 - (article.wordCount ?? 0)} more words before submitting
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {viewPublicSlug && (
                      <Link
                        href={`/articles/${viewPublicSlug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-brand-surface-alt transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    )}
                    {viewOnly && (
                      <span className="px-3 py-1.5 text-xs font-medium text-brand-text-muted border border-slate-100 rounded-lg bg-brand-surface">
                        Read-only
                      </span>
                    )}
                    {canEdit && (
                      <Link
                        href={`/member/articles/${article.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                    )}
                    {canSubmit && (
                      <button
                        onClick={() => submitMutation.mutate(article.id)}
                        disabled={submitMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Submit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this draft permanently?')) {
                            deleteMutation.mutate(article.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
