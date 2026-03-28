'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import DashboardStats from '@/components/member/DashboardStats';
import type { DashboardStats as DashboardStatsType } from '@/types/api';

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => apiClient.get<DashboardStatsType>('/dashboard/stats'),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-card h-36 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-card h-64 animate-pulse" />
          <div className="bg-white rounded-xl shadow-card h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">Unable to load dashboard data.</p>
          <p className="text-red-500 text-sm mt-1">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  return <DashboardStats stats={stats} />;
}
