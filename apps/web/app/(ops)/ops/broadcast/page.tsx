'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { BroadcastLog } from '@/types/api';

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'members', label: 'All Members' },
  { value: 'verified', label: 'Verified Members Only' },
  { value: 'standard', label: 'Tier: Standard' },
  { value: 'professional', label: 'Tier: Professional' },
  { value: 'premium', label: 'Tier: Premium' },
  { value: 'elite', label: 'Tier: Elite' },
];

export default function BroadcastPage() {
  const qc = useQueryClient();
  const [audience, setAudience] = useState('all');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: queryKeys.ops.broadcastLogs(),
    queryFn: () => apiClient.get<BroadcastLog[]>('/ops/broadcast/logs'),
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/ops/broadcast', { audience, subject, body }),
    onSuccess: (data: unknown) => {
      void qc.invalidateQueries({ queryKey: queryKeys.ops.broadcastLogs() });
      const result = data as { recipientCount?: number };
      setSuccess(
        `Broadcast sent to ${result?.recipientCount ?? 'all'} recipient${
          result?.recipientCount !== 1 ? 's' : ''
        }.`
      );
      setSubject('');
      setBody('');
    },
  });

  const canSend = subject.trim().length > 0 && body.trim().length > 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Broadcast</h2>
        <p className="text-sm text-slate-500 mt-1">
          Send email broadcasts to selected audiences
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Compose panel */}
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Compose Message</h3>

            {/* Audience */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Subject *
              </label>
              <input
                type="text"
                placeholder="Email subject line…"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Body */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Message Body *
              </label>
              <textarea
                placeholder="Write your message here. Plain text or basic HTML supported."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y font-mono"
              />
              <p className="text-xs text-slate-400 mt-1">{body.length} characters</p>
            </div>

            {/* Success message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                ✓ {success}
              </div>
            )}

            {/* Error message */}
            {sendMutation.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {String(sendMutation.error)}
              </div>
            )}

            <button
              onClick={() => {
                setSuccess(null);
                sendMutation.mutate();
              }}
              disabled={!canSend || sendMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors disabled:opacity-60"
            >
              {sendMutation.isPending ? 'Sending…' : '📢 Send Broadcast'}
            </button>
          </div>

          {/* Preview */}
          {body.trim() && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Preview
              </h3>
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <p className="text-sm font-semibold text-slate-900 mb-2">
                  {subject || '(No subject)'}
                </p>
                <div
                  className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Recent logs */}
        <div className="w-80 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Recent Broadcasts
            </h3>

            {logsLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No broadcasts yet</p>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="border border-slate-100 rounded-lg p-3"
                  >
                    <p className="text-sm font-medium text-slate-900 line-clamp-1">
                      {log.subject}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-blue-600 font-medium">
                        {log.recipientCount} recipients
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(log.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
