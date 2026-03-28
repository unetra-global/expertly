'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { OpsApplication, Service, OpsUser } from '@/types/api';

const TIER_OPTIONS: { value: string; label: string }[] = [
  { value: 'budding_entrepreneur', label: 'Budding Entrepreneur' },
  { value: 'seasoned_professional', label: 'Seasoned Professional' },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  waitlisted: 'bg-purple-100 text-purple-700',
};


export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const qc = useQueryClient();

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedTier, setSelectedTier] = useState('budding_entrepreneur');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [paymentReceivedAt, setPaymentReceivedAt] = useState('');
  const [paymentReceivedBy, setPaymentReceivedBy] = useState('');
  const [membershipExpiryAt, setMembershipExpiryAt] = useState('');

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
      if (app.membershipTier && selectedTier === 'budding_entrepreneur') {
        setSelectedTier(app.membershipTier);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.id]);

  const { data: services = [] } = useQuery({
    queryKey: queryKeys.taxonomy.services(),
    queryFn: () => apiClient.get<Service[]>('/taxonomy/services'),
  });

  const { data: opsUsers = [] } = useQuery({
    queryKey: queryKeys.ops.users(),
    queryFn: () => apiClient.get<OpsUser[]>('/ops/users'),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.ops.applications() });
    void qc.invalidateQueries({ queryKey: queryKeys.ops.application(id) });
    void qc.invalidateQueries({ queryKey: queryKeys.ops.stats() });
  };

  const approveMutation = useMutation({
    mutationFn: () =>
      apiClient.patch(`/ops/applications/${id}/approve`, {
        serviceId: selectedServiceId || app?.primaryServiceId,
        membershipTier: selectedTier,
      }),
    onSuccess: () => {
      invalidate();
      router.push('/ops/applications');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      apiClient.patch(`/ops/applications/${id}/reject`, { rejectionReason: rejectReason }),
    onSuccess: () => {
      invalidate();
      setShowRejectModal(false);
      router.push('/ops/applications');
    },
  });

  const waitlistMutation = useMutation({
    mutationFn: () => apiClient.patch(`/ops/applications/${id}/waitlist`, {}),
    onSuccess: () => {
      invalidate();
    },
  });

  const activateMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/ops/members/${id}/activate`, {
        paymentReceivedAt: paymentReceivedAt || new Date().toISOString(),
        paymentReceivedBy: paymentReceivedBy || undefined,
        membershipExpiryAt: membershipExpiryAt || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setShowActivateModal(false);
      router.push('/ops/members');
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

  const isApprovable = ['submitted', 'under_review', 'waitlisted'].includes(app.status);
  const isActivatable = app.status === 'approved';

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
              {(app.profilePhotoBase64 || app.profilePhotoUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    app.profilePhotoBase64
                      ? `data:image/webp;base64,${app.profilePhotoBase64}`
                      : app.profilePhotoUrl!
                  }
                  alt=""
                  className="w-16 h-16 rounded-full object-cover shrink-0"
                />
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">
                  {app.designation ?? '—'}
                </h3>
                {app.firmName && (
                  <p className="text-sm text-slate-500">
                    {app.firmName}
                    {app.firmSize ? ` · ${app.firmSize}` : ''}
                    {app.websiteUrl ? (
                      <>
                        {' · '}
                        <a
                          href={app.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Website ↗
                        </a>
                      </>
                    ) : null}
                  </p>
                )}
                <p className="text-sm text-slate-500">
                  {[app.city, app.state, app.country, app.region].filter(Boolean).join(', ')}
                </p>
                <div className="flex gap-3 mt-1 flex-wrap">
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
            </div>

            {app.headline && (
              <p className="mt-3 text-sm text-slate-700 font-medium">{app.headline}</p>
            )}
            {app.bio && (
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{app.bio}</p>
            )}
          </div>

          {/* Contact details */}
          {(app.contactEmail || app.phone) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Contact
              </h4>
              <div className="space-y-1 text-sm text-slate-700">
                {app.contactEmail && (
                  <p>
                    <span className="text-slate-400 mr-2">Email</span>
                    {app.contactEmail}
                  </p>
                )}
                {app.phone && (
                  <p>
                    <span className="text-slate-400 mr-2">Phone</span>
                    {app.phoneExtension ? `${app.phoneExtension} ` : ''}{app.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Fee range & experience */}
          {(app.consultationFeeMinUsd || app.consultationFeeMaxUsd || app.yearsOfExperience) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Professional Overview
              </h4>
              <div className="space-y-1 text-sm text-slate-700">
                {app.yearsOfExperience != null && (
                  <p>
                    <span className="text-slate-400 mr-2">Experience</span>
                    {app.yearsOfExperience} year{app.yearsOfExperience !== 1 ? 's' : ''}
                  </p>
                )}
                {(app.consultationFeeMinUsd || app.consultationFeeMaxUsd) && (
                  <p>
                    <span className="text-slate-400 mr-2">Consultation Fee</span>
                    USD {app.consultationFeeMinUsd ?? '?'} – {app.consultationFeeMaxUsd ?? '?'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Work experience */}
          {app.workExperience && app.workExperience.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Work Experience
              </h4>
              <div className="space-y-4">
                {app.workExperience.map((w) => {
                  const start = w.startDate
                    ? w.startDate.slice(0, 7)
                    : (w.startYear ?? '?');
                  const end = w.isCurrent
                    ? 'Present'
                    : (w.endDate ? w.endDate.slice(0, 7) : (w.endYear ?? '?'));
                  return (
                    <div key={w.id} className="border-l-2 border-slate-100 pl-3">
                      <p className="font-medium text-sm text-slate-900">{w.title}</p>
                      <p className="text-xs text-slate-600">
                        {w.company}
                        {w.city ? ` · ${w.city}` : ''}
                        {w.website ? (
                          <>
                            {' · '}
                            <a
                              href={w.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Website ↗
                            </a>
                          </>
                        ) : null}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{String(start)} – {String(end)}</p>
                      {w.description && (
                        <p className="text-xs text-slate-600 mt-1">{w.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Education */}
          {app.education && app.education.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Education
              </h4>
              <div className="space-y-3">
                {app.education.map((e) => (
                  <div key={e.id} className="border-l-2 border-slate-100 pl-3">
                    <p className="font-medium text-sm text-slate-900">{e.degree}</p>
                    <p className="text-xs text-slate-600">
                      {e.institution}
                      {e.field ? ` · ${e.field}` : ''}
                    </p>
                    {(e.startYear || e.endYear) && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {e.startYear ?? '?'} – {e.endYear ?? 'Present'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qualifications */}
          {app.qualifications && app.qualifications.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Qualifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {app.qualifications.map((q, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Credentials & Documents */}
          {app.credentials && app.credentials.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Credentials &amp; Documents
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Click &quot;View Document&quot; to open the uploaded file and verify each credential.
              </p>
              <div className="space-y-3">
                {app.credentials.map((c) => {
                  const credName = c.qualificationName ?? c.name ?? '—';
                  const docUrl = c.documentUrl ?? c.url;
                  return (
                    <div
                      key={c.id}
                      className={`rounded-lg border p-3 ${
                        docUrl
                          ? 'border-slate-200 bg-slate-50'
                          : 'border-amber-200 bg-amber-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {c.abbreviation && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-700">
                                {c.abbreviation}
                              </span>
                            )}
                            <p className="text-sm font-medium text-slate-900">{credName}</p>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {c.issuingBody ?? '—'}
                            {c.year ? ` · ${c.year}` : ''}
                          </p>
                        </div>

                        {docUrl ? (
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            View Document ↗
                          </a>
                        ) : (
                          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg">
                            No document uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key engagements */}
          {app.keyEngagements && app.keyEngagements.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Key Engagements
              </h4>
              <ul className="space-y-1 list-disc list-inside">
                {app.keyEngagements.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Motivation */}
          {(app.motivationWhy || app.motivationEngagement || app.motivationUnique) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Motivation
              </h4>
              <div className="space-y-4">
                {app.motivationWhy && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Why do you want to join?</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{app.motivationWhy}</p>
                  </div>
                )}
                {app.motivationEngagement && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">How do you plan to engage?</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{app.motivationEngagement}</p>
                  </div>
                )}
                {app.motivationUnique && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">What makes you unique?</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{app.motivationUnique}</p>
                  </div>
                )}
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
              disabled={!isApprovable}
            >
              <option value="">— Select service —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

          </div>

          {/* Tier selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Membership Tier
            </h4>
            <select
              value={selectedTier || app.membershipTier || 'budding_entrepreneur'}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={!isApprovable}
            >
              {TIER_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Step 1 actions — Approve / Waitlist / Reject */}
          {isApprovable && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Step 1 — Review Decision
              </h4>
              <p className="text-xs text-slate-400">
                Approving sends the applicant a K2 email with payment instructions.
              </p>

              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {approveMutation.isPending ? 'Approving…' : '✓ Approve'}
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

          {/* Step 2 — Activate after payment confirmed */}
          {isActivatable && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-5 space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                  Step 2 — Confirm Payment &amp; Activate
                </h4>
                <p className="text-xs text-green-600 mt-1">
                  The applicant has been sent payment instructions. Once you confirm payment has been received, activate their membership.
                </p>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Payment Received Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentReceivedAt}
                    onChange={(e) => setPaymentReceivedAt(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Confirmed By
                  </label>
                  <select
                    value={paymentReceivedBy}
                    onChange={(e) => setPaymentReceivedBy(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="">— Select team member —</option>
                    {opsUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Membership Expiry Date
                    <span className="text-slate-400 font-normal"> (defaults to 1 year)</span>
                  </label>
                  <input
                    type="date"
                    value={membershipExpiryAt}
                    onChange={(e) => setMembershipExpiryAt(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowActivateModal(true)}
                disabled={!paymentReceivedAt}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                Activate Membership
              </button>
            </div>
          )}

          {/* Error display */}
          {(approveMutation.error || rejectMutation.error || waitlistMutation.error || activateMutation.error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {String(
                (approveMutation.error || rejectMutation.error || waitlistMutation.error || activateMutation.error) ?? 'Error'
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

      {/* Activate confirmation modal */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Confirm Membership Activation</h3>
            <p className="text-sm text-slate-500 mb-4">
              This will create an active member account for{' '}
              <strong>{[app.firstName, app.lastName].filter(Boolean).join(' ')}</strong> and send them the K17 welcome email. This cannot be undone.
            </p>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1 mb-4">
              <p><span className="font-medium">Payment date:</span> {paymentReceivedAt}</p>
              {paymentReceivedBy && (
                <p>
                  <span className="font-medium">Confirmed by:</span>{' '}
                  {(() => {
                    const u = opsUsers.find((x) => x.id === paymentReceivedBy);
                    return u ? ([u.firstName, u.lastName].filter(Boolean).join(' ') || u.email) : paymentReceivedBy;
                  })()}
                </p>
              )}
              {membershipExpiryAt && <p><span className="font-medium">Expires:</span> {membershipExpiryAt}</p>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowActivateModal(false)}
                className="flex-1 border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => activateMutation.mutate()}
                disabled={activateMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {activateMutation.isPending ? 'Activating…' : 'Confirm & Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

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
