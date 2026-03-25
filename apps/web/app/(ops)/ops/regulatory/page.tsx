'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useState } from 'react';

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

interface TriggerResult {
  inserted: number;
  sources: string[];
}

const REGION_COLORS: Record<string, string> = {
  IN: 'bg-orange-50 text-orange-700',
  SG: 'bg-red-50 text-red-700',
  US: 'bg-blue-50 text-blue-700',
};

export default function RegulatoryPage() {
  const queryClient = useQueryClient();
  const [triggerResult, setTriggerResult] = useState<TriggerResult | null>(null);

  const { data: updates = [], isLoading } = useQuery({
    queryKey: ['regulatory', 'updates'],
    queryFn: () => apiClient.get<RegulatoryUpdate[]>('/ops/regulatory'),
  });

  const trigger = useMutation({
    mutationFn: () => apiClient.post<TriggerResult>('/ops/regulatory/trigger', {}),
    onSuccess: (result) => {
      setTriggerResult(result);
      void queryClient.invalidateQueries({ queryKey: ['regulatory', 'updates'] });
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Regulatory Updates</h2>
          <p className="text-sm text-slate-500 mt-1">
            Ingested from RSS feeds — CBIC, MCA, RBI, SEBI, MAS, ACRA, IRS, SEC
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={() => { setTriggerResult(null); trigger.mutate(); }}
            disabled={trigger.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm font-medium rounded-lg hover:bg-[#162d4a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {trigger.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Fetching feeds…
              </>
            ) : (
              <>
                <span>↻</span>
                Run Ingestion Now
              </>
            )}
          </button>

          {trigger.isError && (
            <p className="text-xs text-red-600">Ingestion failed — check API logs</p>
          )}

          {triggerResult && (
            <p className="text-xs text-green-700">
              {triggerResult.inserted === 0
                ? 'No new items — all feeds up to date'
                : `+${triggerResult.inserted} new item${triggerResult.inserted !== 1 ? 's' : ''} — ${triggerResult.sources.join(', ')}`}
            </p>
          )}
        </div>
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
            Click <span className="font-medium">Run Ingestion Now</span> to fetch from all 8 RSS feeds
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
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${REGION_COLORS[update.region] ?? 'bg-slate-100 text-slate-700'}`}>
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
