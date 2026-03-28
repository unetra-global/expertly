'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import ProfileEditor from '@/components/member/ProfileEditor';
import type { MemberMe } from '@/types/api';

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: queryKeys.members.me(),
    queryFn: () => apiClient.get<MemberMe>('/members/me'),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-card h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">Unable to load your profile.</p>
          <p className="text-red-500 text-sm mt-1">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  return <ProfileEditor profile={profile} />;
}
