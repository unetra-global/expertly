'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { OpsArticle } from '@/types/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  archived: 'bg-slate-100 text-slate-500',
};

export default function ArticlesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get('status') ?? '');

  useEffect(() => {
    setStatus(searchParams.get('status') ?? '');
  }, [searchParams]);

  const filters = status ? { status } : {};

  const { data: response, isLoading } = useQuery({
    queryKey: queryKeys.ops.articles(filters),
    queryFn: () => {
      const qs = status ? `?status=${status}` : '';
      return apiClient.get<{ data: OpsArticle[]; meta: { total: number } }>(`/ops/articles${qs}`);
    },
  });

  const articles = response?.data ?? [];

  const handleStatusChange = (val: string) => {
    setStatus(val);
    const params = new URLSearchParams();
    if (val) params.set('status', val);
    const qs = params.toString();
    router.replace(`/ops/articles${qs ? `?${qs}` : ''}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Articles</h2>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? 'Loading…' : `${articles.length} article${articles.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Published
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    No articles found
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr
                    key={article.id}
                    onClick={() => router.push(`/ops/articles/${article.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 line-clamp-1">
                        {article.title ?? '(Untitled)'}
                      </p>
                      {article.excerpt && (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {article.excerpt}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[article.status] ?? 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {article.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {article.creationMode ? (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            article.creationMode === 'ai'
                              ? 'bg-violet-100 text-violet-700'
                              : 'bg-teal-100 text-teal-700'
                          }`}
                        >
                          {article.creationMode === 'ai' ? '✨ AI' : '✍ Manual'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {article.submittedAt
                        ? new Date(article.submittedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
