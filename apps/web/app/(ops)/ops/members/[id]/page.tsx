'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { OpsMember, Service } from '@/types/api';
import { MEMBER_TIERS, MEMBER_TIER_LABELS, type MemberTier } from '@expertly/utils';

interface CredentialForm {
  name: string;
  issuingBody: string;
  year: string;
  url: string;
}

const EMPTY_CREDENTIAL: CredentialForm = { name: '', issuingBody: '', year: '', url: '' };

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatWorkPeriod(exp: { startDate?: string; endDate?: string; startYear?: number; endYear?: number; isCurrent?: boolean }) {
  const start = exp.startDate
    ? new Date(exp.startDate + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : exp.startYear?.toString() ?? '';
  const end = exp.isCurrent
    ? 'Present'
    : exp.endDate
    ? new Date(exp.endDate + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : exp.endYear?.toString() ?? 'Present';
  return start && end ? `${start} – ${end}` : start || end;
}

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [credentialForm, setCredentialForm] = useState<CredentialForm>(EMPTY_CREDENTIAL);
  const [selectedTier, setSelectedTier] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [serviceChangeId, setServiceChangeId] = useState('');

  const { data: member, isLoading } = useQuery({
    queryKey: queryKeys.ops.member(id),
    queryFn: () => apiClient.get<OpsMember>(`/ops/members/${id}`),
    enabled: !!id,
  });

  useEffect(() => {
    if (member?.membershipTier && !selectedTier) {
      setSelectedTier(member.membershipTier);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id]);

  const { data: services = [] } = useQuery({
    queryKey: queryKeys.taxonomy.services(),
    queryFn: () => apiClient.get<Service[]>('/taxonomy/services'),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.ops.members() });
    void qc.invalidateQueries({ queryKey: queryKeys.ops.member(id) });
    void qc.invalidateQueries({ queryKey: queryKeys.ops.stats() });
  };

  const verifyMutation = useMutation({
    mutationFn: () => apiClient.post(`/ops/members/${id}/verify`, {}),
    onSuccess: invalidate,
  });

  const suspendMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/ops/members/${id}/suspend`, { reason: suspendReason }),
    onSuccess: () => {
      invalidate();
      setShowSuspendModal(false);
      setSuspendReason('');
    },
  });

  const tierMutation = useMutation({
    mutationFn: () =>
      apiClient.patch(`/ops/members/${id}/tier`, { tier: selectedTier }),
    onSuccess: invalidate,
  });

  const featuredMutation = useMutation({
    mutationFn: () =>
      apiClient.patch(`/ops/members/${id}/featured`, { isFeatured: !member?.isFeatured }),
    onSuccess: invalidate,
  });

  const credentialMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/ops/members/${id}/credential`, {
        name: credentialForm.name,
        issuingBody: credentialForm.issuingBody || undefined,
        year: credentialForm.year ? parseInt(credentialForm.year, 10) : undefined,
        url: credentialForm.url || undefined,
        isVerified: true,
      }),
    onSuccess: () => {
      invalidate();
      setShowCredentialModal(false);
      setCredentialForm(EMPTY_CREDENTIAL);
    },
  });

  const serviceChangeMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/ops/members/${id}/service-change`, {
        newServiceId: serviceChangeId,
      }),
    onSuccess: invalidate,
  });

  const renewMutation = useMutation({
    mutationFn: () =>
      apiClient.patch(`/ops/members/${id}/renew`, {
        membershipExpiryAt: newExpiryDate,
        paymentReceivedAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      invalidate();
      setNewExpiryDate('');
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

  if (!member) {
    return <div className="text-center py-12 text-slate-400">Member not found.</div>;
  }

  const isExpiring =
    member.membershipExpiryAt &&
    new Date(member.membershipExpiryAt) < new Date(Date.now() + 30 * 864e5);

  const photoSrc = member.profilePhotoBase64
    ? `data:image/webp;base64,${member.profilePhotoBase64}`
    : member.profilePhotoUrl ?? null;

  const fullName = [member.firstName, member.lastName].filter(Boolean).join(' ') || member.slug;

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
        <div className="flex items-center gap-3">
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoSrc} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-lg font-semibold">
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
            <p className="text-sm text-slate-500">
              {member.designation}
              {member.slug && <span className="ml-2 text-slate-400">· {member.slug}</span>}
              {member.isVerified && (
                <span className="ml-2 text-green-600 font-medium">✓ Verified</span>
              )}
              {member.isFeatured && (
                <span className="ml-2 text-amber-600 font-medium">★ Featured</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left panel — member profile */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Profile */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Profile</h4>
            {member.headline && (
              <p className="font-medium text-slate-900 mb-2">{member.headline}</p>
            )}
            {member.bio && (
              <p className="text-sm text-slate-600 leading-relaxed">{member.bio}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {(member.city || member.country) && (
                <span>{[member.city, member.state, member.region, member.country].filter(Boolean).join(', ')}</span>
              )}
              {member.linkedinUrl && (
                <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  LinkedIn ↗
                </a>
              )}
              {member.website && (
                <a href={member.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Website ↗
                </a>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {member.email && (
                <div>
                  <p className="text-slate-500 text-xs">Account Email</p>
                  <p className="font-medium text-slate-900">{member.email}</p>
                </div>
              )}
              {member.contactEmail && (
                <div>
                  <p className="text-slate-500 text-xs">Contact Email</p>
                  <p className="font-medium text-slate-900">{member.contactEmail}</p>
                </div>
              )}
              {member.contactPhone && (
                <div>
                  <p className="text-slate-500 text-xs">Phone</p>
                  <p className="font-medium text-slate-900">{member.contactPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Professional Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Professional Overview</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {member.yearsOfExperience != null && (
                <div>
                  <p className="text-slate-500 text-xs">Years of Experience</p>
                  <p className="font-medium text-slate-900">{member.yearsOfExperience} years</p>
                </div>
              )}
              {member.firmName && (
                <div>
                  <p className="text-slate-500 text-xs">Firm</p>
                  <p className="font-medium text-slate-900">
                    {member.firmName}
                    {member.firmSize && <span className="text-slate-500"> · {member.firmSize}</span>}
                  </p>
                </div>
              )}
              {(member.consultationFeeMinUsd != null || member.consultationFeeMaxUsd != null) && (
                <div>
                  <p className="text-slate-500 text-xs">Consultation Fee (USD)</p>
                  <p className="font-medium text-slate-900">
                    {member.consultationFeeMinUsd != null && member.consultationFeeMaxUsd != null
                      ? `$${member.consultationFeeMinUsd} – $${member.consultationFeeMaxUsd}`
                      : member.consultationFeeMinUsd != null
                      ? `From $${member.consultationFeeMinUsd}`
                      : `Up to $${member.consultationFeeMaxUsd}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Membership */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Membership</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Tier</p>
                <p className="font-medium text-slate-900">
                  {member.membershipTier ? (MEMBER_TIER_LABELS[member.membershipTier as MemberTier] ?? member.membershipTier) : '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Status</p>
                <p className={`font-medium ${member.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {member.status ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Start Date</p>
                <p className="font-medium text-slate-900">
                  {formatDate(member.membershipStartDate) ?? formatDate(member.createdAt) ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Expiry Date</p>
                <p className={`font-medium ${isExpiring ? 'text-red-600' : 'text-slate-900'}`}>
                  {formatDate(member.membershipExpiryAt) ?? '—'}
                  {isExpiring && ' ⚠'}
                </p>
              </div>
            </div>
          </div>

          {/* Qualifications */}
          {member.qualifications && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Qualifications</h4>
              <div className="flex flex-wrap gap-2">
                {member.qualifications.split(',').map((q, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {q.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Credentials */}
          {member.credentials && member.credentials.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Credentials</h4>
              <div className="space-y-3">
                {member.credentials.map((c) => {
                  const credName = c.qualificationName ?? c.name ?? '';
                  const docUrl = c.documentUrl ?? c.url;
                  return (
                    <div key={c.id} className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className={`mt-0.5 text-xs shrink-0 ${c.isVerified ? 'text-green-600' : 'text-slate-400'}`}>
                          {c.isVerified ? '✓' : '○'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            {credName}
                            {c.abbreviation && <span className="ml-1 text-slate-500">({c.abbreviation})</span>}
                          </p>
                          {(c.issuingBody || c.year) && (
                            <p className="text-xs text-slate-500">
                              {[c.issuingBody, c.year].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {docUrl ? (
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                          >
                            View Document ↗
                          </a>
                        ) : (
                          <span className="text-xs text-amber-600 whitespace-nowrap">No document</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {member.workExperience && member.workExperience.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Work Experience</h4>
              <div className="space-y-4">
                {member.workExperience.map((exp, i) => (
                  <div key={exp.id ?? i} className="border-l-2 border-blue-200 pl-3">
                    <p className="text-sm font-medium text-slate-900">{exp.title}</p>
                    <p className="text-sm text-slate-700">{exp.company}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatWorkPeriod(exp)}</p>
                    {exp.description && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {member.education && member.education.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Education</h4>
              <div className="space-y-3">
                {member.education.map((edu, i) => (
                  <div key={edu.id ?? i} className="border-l-2 border-purple-200 pl-3">
                    <p className="text-sm font-medium text-slate-900">{edu.degree}</p>
                    <p className="text-sm text-slate-700">{edu.institution}</p>
                    {edu.field && <p className="text-xs text-slate-500">{edu.field}</p>}
                    {(edu.startYear || edu.endYear) && (
                      <p className="text-xs text-slate-500">
                        {edu.startYear} {edu.endYear ? `– ${edu.endYear}` : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Engagements */}
          {member.keyEngagements && member.keyEngagements.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Key Engagements</h4>
              <ul className="space-y-1.5">
                {member.keyEngagements.map((eng, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-slate-400 shrink-0 mt-0.5">•</span>
                    <span>{String(eng)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Motivation */}
          {(member.motivationWhy || member.motivationEngagement || member.motivationUnique) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Application Motivation</h4>
              <div className="space-y-4">
                {member.motivationWhy && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Why Expertly?</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{member.motivationWhy}</p>
                  </div>
                )}
                {member.motivationEngagement && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">How will you engage?</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{member.motivationEngagement}</p>
                  </div>
                )}
                {member.motivationUnique && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">What makes you unique?</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{member.motivationUnique}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right panel — actions */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</h4>

            {!member.isVerified && (
              <button
                onClick={() => verifyMutation.mutate()}
                disabled={verifyMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {verifyMutation.isPending ? 'Verifying…' : '✓ Verify Member'}
              </button>
            )}

            <button
              onClick={() => featuredMutation.mutate()}
              disabled={featuredMutation.isPending}
              className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {featuredMutation.isPending
                ? 'Updating…'
                : member.isFeatured
                ? '★ Remove Featured'
                : '☆ Mark as Featured'}
            </button>

            <button
              onClick={() => setShowSuspendModal(true)}
              className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              ⊘ Suspend Member
            </button>

            <button
              onClick={() => setShowCredentialModal(true)}
              className="w-full border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              + Add Credential
            </button>
          </div>

          {/* Change tier */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Change Tier</h4>
            <select
              value={selectedTier || member.membershipTier || 'budding_entrepreneur'}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {MEMBER_TIERS.map((t) => (
                <option key={t} value={t}>{MEMBER_TIER_LABELS[t]}</option>
              ))}
            </select>
            <button
              onClick={() => tierMutation.mutate()}
              disabled={
                tierMutation.isPending ||
                (selectedTier || member.membershipTier) === member.membershipTier
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {tierMutation.isPending ? 'Updating…' : 'Update Tier'}
            </button>
          </div>

          {/* Service change */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trigger Service Change</h4>
            <select
              value={serviceChangeId}
              onChange={(e) => setServiceChangeId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">— Select new service —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              onClick={() => serviceChangeMutation.mutate()}
              disabled={!serviceChangeId || serviceChangeMutation.isPending}
              className="w-full bg-slate-700 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {serviceChangeMutation.isPending ? 'Processing…' : 'Approve Service Change'}
            </button>
          </div>

          {/* Renew membership */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Renew Membership</h4>
            <div>
              <label className="text-xs text-slate-500 block mb-1">New Expiry Date</label>
              <input
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => renewMutation.mutate()}
              disabled={!newExpiryDate || renewMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {renewMutation.isPending ? 'Renewing…' : 'Confirm Renewal'}
            </button>
          </div>

          {/* Mutation errors */}
          {[verifyMutation, suspendMutation, tierMutation, featuredMutation, credentialMutation, serviceChangeMutation, renewMutation].map(
            (m, i) =>
              m.error ? (
                <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {String(m.error)}
                </div>
              ) : null
          )}
        </div>
      </div>

      {/* Suspend modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Suspend Member</h3>
            <p className="text-sm text-slate-500 mb-4">
              Provide a reason. The member will receive a notification.
            </p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Reason for suspension…"
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="flex-1 border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => suspendMutation.mutate()}
                disabled={!suspendReason.trim() || suspendMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {suspendMutation.isPending ? 'Suspending…' : 'Confirm Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add credential modal */}
      {showCredentialModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Credential</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Credential name *"
                value={credentialForm.name}
                onChange={(e) =>
                  setCredentialForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Issuing body"
                value={credentialForm.issuingBody}
                onChange={(e) =>
                  setCredentialForm((f) => ({ ...f, issuingBody: e.target.value }))
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Year"
                  value={credentialForm.year}
                  onChange={(e) =>
                    setCredentialForm((f) => ({ ...f, year: e.target.value }))
                  }
                  className="w-1/2 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="URL"
                  value={credentialForm.url}
                  onChange={(e) =>
                    setCredentialForm((f) => ({ ...f, url: e.target.value }))
                  }
                  className="w-1/2 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowCredentialModal(false);
                  setCredentialForm(EMPTY_CREDENTIAL);
                }}
                className="flex-1 border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => credentialMutation.mutate()}
                disabled={!credentialForm.name.trim() || credentialMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {credentialMutation.isPending ? 'Adding…' : 'Add Credential'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
