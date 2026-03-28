'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { OpsMember } from '@/types/api';

const FILTER_TABS = [
  { value: '', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'pending_re_verification', label: 'Pending Re-verify' },
  { value: 'expiring', label: 'Expiring Soon' },
];

const TIER_COLORS: Record<string, string> = {
  standard: 'bg-slate-100 text-slate-600',
  professional: 'bg-blue-100 text-blue-700',
  premium: 'bg-purple-100 text-purple-700',
  elite: 'bg-amber-100 text-amber-700',
};

export default function MembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState(searchParams?.get('filter') ?? '');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setFilter(searchParams?.get('filter') ?? '');
  }, [searchParams]);

  const filters = filter ? { filter } : {};

  const { data: response, isLoading } = useQuery({
    queryKey: queryKeys.ops.members(filters),
    queryFn: () => {
      const qs = filter ? `?filter=${filter}` : '';
      return apiClient.get<{ data: OpsMember[]; meta: { total: number } }>(`/ops/members${qs}`);
    },
  });

  const members = response?.data ?? [];

  const handleFilterChange = (val: string) => {
    setFilter(val);
    const params = new URLSearchParams();
    if (val) params.set('filter', val);
    const qs = params.toString();
    router.replace(`/ops/members${qs ? `?${qs}` : ''}`);
  };

  const filtered = search.trim()
    ? members.filter((m) => {
        const name = [m.firstName, m.lastName].join(' ').toLowerCase();
        return (
          name.includes(search.toLowerCase()) ||
          m.slug.toLowerCase().includes(search.toLowerCase())
        );
      })
    : members;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Members</h2>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? 'Loading…' : `${filtered.length} member${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <input
          type="search"
          placeholder="Search by name or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-56 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-lg w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === tab.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
                  Member
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Expires
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No members found
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const isExpiring =
                    m.membershipExpiryAt &&
                    new Date(m.membershipExpiryAt) < new Date(Date.now() + 30 * 864e5);

                  return (
                    <tr
                      key={m.id}
                      onClick={() => router.push(`/ops/members/${m.id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {[m.firstName, m.lastName].filter(Boolean).join(' ') || '—'}
                        </p>
                        <p className="text-xs text-slate-400">{m.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{m.designation ?? '—'}</td>
                      <td className="px-4 py-3">
                        {m.membershipTier ? (
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              TIER_COLORS[m.membershipTier] ?? 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {m.membershipTier}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium ${
                            m.isVerified ? 'text-green-600' : 'text-slate-400'
                          }`}
                        >
                          {m.isVerified ? '✓ Verified' : 'Unverified'}
                        </span>
                        {m.pendingReVerification && (
                          <span className="ml-1 text-xs text-amber-600 font-medium">
                            (re-verify)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{m.country ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs ${
                            isExpiring ? 'text-red-600 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          {m.membershipExpiryAt
                            ? new Date(m.membershipExpiryAt).toLocaleDateString()
                            : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
