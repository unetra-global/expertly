'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { OpsApplication, Seat, Service } from '@/types/api';

const TIER_OPTIONS = ['standard', 'professional', 'premium', 'elite'];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  waitlisted: 'bg-purple-100 text-purple-700',
};

function SeatBar({ seats, serviceId }: { seats: Seat[]; serviceId?: string }) {
  const seat = seats.find((s) => s.serviceId === serviceId);
  if (!seat) return null;
  const pct = seat.capacity > 0 ? Math.round((seat.claimedCount / seat.capacity) * 100) : 0;
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
        <span>Seat Availability</span>
        <span className={pct >= 100 ? 'text-red-600 font-semibold' : ''}>
          {seat.claimedCount} / {seat.capacity} ({pct}%)
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      {pct >= 100 && (
        <p className="text-xs text-red-600 mt-1 font-medium">⚠ No seats available for this service</p>
      )}
    </div>
  );
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedTier, setSelectedTier] = useState('standard');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: app, isLoading } = useQuery({
    queryKey: queryKeys.ops.application(id),
    queryFn: () => apiClient.get<OpsApplication>(`/ops/applications/${id}`),
    enabled: !!id,
  });

  // Initialise dropdowns from fetched data (React Query v5 — no onSuccess)
  useEffect(() => {
    if (app) {
      if (app.primaryServiceId && !selectedServiceId) {
        setSelectedServiceId(app.primaryServiceId);
      }
      if (app.membershipTier && selectedTier === 'standard') {
        setSelectedTier(app.membershipTier);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.id]);

  const { data: seats = [] } = useQuery({
    queryKey: queryKeys.ops.seats(),
    queryFn: () => apiClient.get<Seat[]>('/ops/seats'),
  });

  const { data: services = [] } = useQuery({
    queryKey: queryKeys.taxonomy.services(),
    queryFn: () => apiClient.get<Service[]>('/taxonomy/services'),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.ops.applications() });
    void qc.invalidateQueries({ queryKey: queryKeys.ops.application(id) });
    void qc.invalidateQueries({ queryKey: queryKeys.ops.stats() });
  };

  const approveMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/ops/applications/${id}/approve`, {
        primaryServiceId: selectedServiceId || app?.primaryServiceId,
        membershipTier: selectedTier,
      }),
    onSuccess: () => {
      invalidate();
      router.push('/ops/applications');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/ops/applications/${id}/reject`, { reason: rejectReason }),
    onSuccess: () => {
      invalidate();
      setShowRejectModal(false);
      router.push('/ops/applications');
    },
  });

  const waitlistMutation = useMutation({
    mutationFn: () => apiClient.post(`/ops/applications/${id}/waitlist`, {}),
    onSuccess: () => {
      invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="flex gap-6">
        <div className="flex-1 bg-slate-100 rounded-xl h-96 animate-pulse" />
        <div className="w-72 bg-slate-100 rounded-xl h-64 animate-pulse" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-12 text-slate-400">Application not found.</div>
    );
  }

  const isActionable = ['submitted', 'under_review', 'waitlisted'].includes(app.status);

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
          <h2 className="text-2xl font-bold text-slate-900">
            {[app.firstName, app.lastName].filter(Boolean).join(' ') || 'Application'}
          </h2>
          <span
            className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              STATUS_COLORS[app.status] ?? 'bg-slate-100 text-slate-600'
            }`}
          >
            {app.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left panel — applicant details */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Basic info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex gap-4">
              {app.profilePhotoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={app.profilePhotoUrl}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover shrink-0"
                />
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">
                  {app.designation ?? '—'}
                </h3>
                {app.firmName && (
                  <p className="text-sm text-slate-500">{app.firmName} · {app.firmSize}</p>
                )}
                <p className="text-sm text-slate-500">
                  {[app.city, app.country].filter(Boolean).join(', ')}
                </p>
                {app.linkedinUrl && (
                  <a
                    href={app.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    LinkedIn ↗
                  </a>
                )}
              </div>
            </div>

            {app.headline && (
              <p className="mt-3 text-sm text-slate-700 font-medium">{app.headline}</p>
            )}
            {app.bio && (
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{app.bio}</p>
            )}
          </div>

          {/* Fee range */}
          {(app.consultationFeeMinUsd || app.consultationFeeMaxUsd) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Consultation Fees
              </h4>
              <p className="text-sm text-slate-700">
                USD {app.consultationFeeMinUsd ?? '?'} – {app.consultationFeeMaxUsd ?? '?'}
              </p>
            </div>
          )}

          {/* Work experience */}
          {app.workExperience && app.workExperience.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Work Experience
              </h4>
              <div className="space-y-3">
                {app.workExperience.map((w) => (
                  <div key={w.id}>
                    <p className="font-medium text-sm text-slate-900">{w.title}</p>
                    <p className="text-xs text-slate-500">
                      {w.company} · {w.startYear}–{w.isCurrent ? 'Present' : (w.endYear ?? '?')}
                    </p>
                    {w.description && (
                      <p className="text-xs text-slate-600 mt-1">{w.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {app.education && app.education.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Education
              </h4>
              <div className="space-y-2">
                {app.education.map((e) => (
                  <div key={e.id}>
                    <p className="font-medium text-sm text-slate-900">{e.degree}</p>
                    <p className="text-xs text-slate-500">
                      {e.institution} {e.field ? `· ${e.field}` : ''}{' '}
                      {e.endYear ? `(${e.endYear})` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credentials */}
          {app.credentials && app.credentials.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Credentials
              </h4>
              <div className="space-y-2">
                {app.credentials.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className={`text-xs ${c.isVerified ? 'text-green-600' : 'text-slate-400'}`}>
                      {c.isVerified ? '✓' : '○'}
                    </span>
                    <div>
                      <p className="text-sm text-slate-900">{c.name}</p>
                      {c.issuingBody && (
                        <p className="text-xs text-slate-500">{c.issuingBody} {c.year ? `· ${c.year}` : ''}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejection reason (if rejected) */}
          {app.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">
                Rejection Reason
              </p>
              <p className="text-sm text-red-700">{app.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Right panel — action panel */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Service selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Primary Service
            </h4>
            <select
              value={selectedServiceId || app.primaryServiceId || ''}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={!isActionable}
            >
              <option value="">— Select service —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Seat bar */}
            <SeatBar seats={seats} serviceId={selectedServiceId || app.primaryServiceId} />
          </div>

          {/* Tier selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Membership Tier
            </h4>
            <select
              value={selectedTier || app.membershipTier || 'standard'}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize"
              disabled={!isActionable}
            >
              {TIER_OPTIONS.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          {isActionable && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </h4>

              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {approveMutation.isPending ? 'Approving…' : '✓ Approve & Activate'}
              </button>

              <button
                onClick={() => waitlistMutation.mutate()}
                disabled={waitlistMutation.isPending || app.status === 'waitlisted'}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {waitlistMutation.isPending ? 'Moving…' : '⏳ Waitlist'}
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                ✕ Reject
              </button>
            </div>
          )}

          {/* Error display */}
          {(approveMutation.error || rejectMutation.error || waitlistMutation.error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {String(
                (approveMutation.error || rejectMutation.error || waitlistMutation.error) ?? 'Error'
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Created</span>
              <span>{new Date(app.createdAt).toLocaleDateString()}</span>
            </div>
            {app.submittedAt && (
              <div className="flex justify-between">
                <span>Submitted</span>
                <span>{new Date(app.submittedAt).toLocaleDateString()}</span>
              </div>
            )}
            {app.reviewedAt && (
              <div className="flex justify-between">
                <span>Reviewed</span>
                <span>{new Date(app.reviewedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Reject Application</h3>
            <p className="text-sm text-slate-500 mb-4">
              Provide a reason for rejection. The applicant will receive this in their email.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection…"
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
