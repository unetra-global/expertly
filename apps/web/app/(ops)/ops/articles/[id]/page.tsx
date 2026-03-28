'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { OpsArticle } from '@/types/api';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  archived: 'bg-slate-100 text-slate-500',
};

export default function ArticleDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const qc = useQueryClient();

  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: article, isLoading } = useQuery({
    queryKey: queryKeys.ops.article(id),
    queryFn: () => apiClient.get<OpsArticle>(`/ops/articles/${id}`),
    enabled: !!id,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.ops.articles() });
    void qc.invalidateQueries({ queryKey: queryKeys.ops.article(id) });
    void qc.invalidateQueries({ queryKey: queryKeys.ops.stats() });
  };

  const approveMutation = useMutation({
    mutationFn: () => apiClient.post(`/ops/articles/${id}/approve`, {}),
    onSuccess: () => {
      invalidate();
      router.push('/ops/articles');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/ops/articles/${id}/reject`, { reason: rejectReason }),
    onSuccess: () => {
      invalidate();
      setShowRejectModal(false);
      router.push('/ops/articles');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => apiClient.post(`/ops/articles/${id}/archive`, {}),
    onSuccess: () => {
      invalidate();
      router.push('/ops/articles');
    },
  });

  if (isLoading) {
    return (
      <div className="flex gap-6">
        <div className="flex-1 bg-slate-100 rounded-xl h-96 animate-pulse" />
        <div className="w-64 bg-slate-100 rounded-xl h-48 animate-pulse" />
      </div>
    );
  }

  if (!article) {
    return <div className="text-center py-12 text-slate-400">Article not found.</div>;
  }

  const isActionable = ['submitted', 'under_review'].includes(article.status);
  const canArchive = ['published', 'rejected'].includes(article.status);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-slate-700 transition-colors"
        >
          ←
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 line-clamp-2">
            {article.title ?? '(Untitled)'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                STATUS_COLORS[article.status] ?? 'bg-slate-100 text-slate-600'
              }`}
            >
              {article.status.replace('_', ' ')}
            </span>
            {article.creationMode && (
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  article.creationMode === 'ai'
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-teal-100 text-teal-700'
                }`}
              >
                {article.creationMode === 'ai' ? '✨ AI-generated' : '✍ Manual'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left panel — article preview */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 p-6 overflow-hidden">
            {article.excerpt && (
              <p className="text-slate-600 italic text-sm border-l-4 border-slate-200 pl-4 mb-6">
                {article.excerpt}
              </p>
            )}

            {article.body ? (
              <div
                className="prose prose-slate prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: article.body }}
              />
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">No body content</p>
            )}
          </div>
        </div>

        {/* Right panel — metadata + actions */}
        <div className="w-64 shrink-0 space-y-4">
          {/* Metadata */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-xs text-slate-500 space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Details
            </h4>
            {article.tags && article.tags.length > 0 && (
              <div>
                <p className="text-slate-400 mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <span>Created</span>
              <span>{new Date(article.createdAt).toLocaleDateString()}</span>
            </div>
            {article.submittedAt && (
              <div className="flex justify-between">
                <span>Submitted</span>
                <span>{new Date(article.submittedAt).toLocaleDateString()}</span>
              </div>
            )}
            {article.publishedAt && (
              <div className="flex justify-between">
                <span>Published</span>
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Rejection reason */}
          {article.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">
                Rejection Reason
              </p>
              <p className="text-xs text-red-700">{article.rejectionReason}</p>
            </div>
          )}

          {/* Action buttons */}
          {(isActionable || canArchive) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </h4>

              {isActionable && (
                <>
                  <button
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {approveMutation.isPending ? 'Publishing…' : '✓ Approve & Publish'}
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                  >
                    ✕ Reject
                  </button>
                </>
              )}

              {canArchive && (
                <button
                  onClick={() => archiveMutation.mutate()}
                  disabled={archiveMutation.isPending}
                  className="w-full border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
                >
                  {archiveMutation.isPending ? 'Archiving…' : '📦 Archive'}
                </button>
              )}
            </div>
          )}

          {/* Errors */}
          {(approveMutation.error || rejectMutation.error || archiveMutation.error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {String(approveMutation.error || rejectMutation.error || archiveMutation.error)}
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Reject Article</h3>
            <p className="text-sm text-slate-500 mb-4">
              Provide feedback for the author. They can revise and resubmit.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection / feedback for author…"
              rows={4}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {rejectMutation.isPending ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
