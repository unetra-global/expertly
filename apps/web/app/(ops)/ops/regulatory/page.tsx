'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

interface RegulatoryUpdate {
  id: string;
  title: string;
  summary?: string;
  sourceUrl?: string;
  region?: string;
  publishedAt?: string;
  createdAt: string;
  nudgesSent?: number;
}

export default function RegulatoryPage() {
  const { data: updates = [], isLoading } = useQuery({
    queryKey: ['regulatory', 'updates'],
    queryFn: () => apiClient.get<RegulatoryUpdate[]>('/ops/regulatory'),
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Regulatory Updates</h2>
        <p className="text-sm text-slate-500 mt-1">
          Ingested from RSS feeds — CBIC, MCA, RBI, SEBI, MAS, ACRA, IRS, SEC
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : updates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">📡</p>
          <p className="text-slate-900 font-medium">No regulatory updates yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Updates are ingested automatically via the RSS worker
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((update) => (
            <div
              key={update.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {update.region && (
                      <span className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {update.region}
                      </span>
                    )}
                    {update.nudgesSent !== undefined && update.nudgesSent > 0 && (
                      <span className="inline-flex px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        {update.nudgesSent} nudge{update.nudgesSent !== 1 ? 's' : ''} sent
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-slate-900 line-clamp-2">{update.title}</h3>
                  {update.summary && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{update.summary}</p>
                  )}
                </div>
                <div className="text-right shrink-0 text-xs text-slate-400">
                  {update.publishedAt
                    ? new Date(update.publishedAt).toLocaleDateString()
                    : new Date(update.createdAt).toLocaleDateString()}
                </div>
              </div>
              {update.sourceUrl && (
                <a
                  href={update.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs text-blue-600 hover:underline inline-block"
                >
                  View source ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
