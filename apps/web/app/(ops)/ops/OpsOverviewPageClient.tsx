'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { OpsStats } from '@/types/api';

const ACTION_CARDS = [
  {
    label: 'Applications Pending Review',
    key: 'pendingApplications' as keyof OpsStats,
    href: '/ops/applications?status=submitted',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    num: 'text-amber-900',
  },
  {
    label: 'Articles Pending Review',
    key: 'pendingArticles' as keyof OpsStats,
    href: '/ops/articles?status=submitted',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    num: 'text-blue-900',
  },
  {
    label: 'Members Pending Re-verification',
    key: 'pendingReVerification' as keyof OpsStats,
    href: '/ops/members?filter=pending_re_verification',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    num: 'text-purple-900',
  },
  {
    label: 'Members Expiring in 30 Days',
    key: 'expiringIn30Days' as keyof OpsStats,
    href: '/ops/members?filter=expiring',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    num: 'text-red-900',
  },
];

const TOTAL_CARDS = [
  { label: 'Total Applications', key: 'totalApplications' as keyof OpsStats },
  { label: 'Total Members', key: 'totalMembers' as keyof OpsStats },
  { label: 'Total Articles', key: 'totalArticles' as keyof OpsStats },
  { label: 'Total Events', key: 'totalEvents' as keyof OpsStats },
];

export default function OpsOverviewPage() {
  const {
    data: stats,
    isLoading,
    error,
    dataUpdatedAt,
  } = useQuery({
    queryKey: queryKeys.ops.stats(),
    queryFn: () => apiClient.get<OpsStats>('/admin/stats'),
    refetchInterval: 60_000,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
          <p className="text-sm text-slate-500 mt-1">
            Live ops counters — refreshes every 60 seconds
          </p>
        </div>
        {dataUpdatedAt > 0 && (
          <span className="text-xs text-slate-400">
            Last updated {new Date(dataUpdatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 mb-6">
          Failed to load stats. Please refresh the page.
        </div>
      )}

      {stats && (
        <>
          {/* Action counters */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {ACTION_CARDS.map((card) => (
              <Link
                key={card.key}
                href={card.href}
                className={`block rounded-xl border p-6 hover:shadow-md transition-all ${card.bg} ${card.border}`}
              >
                <p className={`text-6xl font-bold mb-3 tabular-nums ${card.num}`}>
                  {stats[card.key] ?? 0}
                </p>
                <p className={`text-sm font-semibold ${card.text}`}>{card.label}</p>
                <p className={`text-xs mt-1 ${card.text} opacity-70`}>Click to view →</p>
              </Link>
            ))}
          </div>

          {/* Totals row */}
          <div className="grid grid-cols-4 gap-4">
            {TOTAL_CARDS.map((item) => (
              <div
                key={item.key}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <p className="text-3xl font-bold text-slate-900 tabular-nums">
                  {stats[item.key] ?? 0}
                </p>
                <p className="text-xs text-slate-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
