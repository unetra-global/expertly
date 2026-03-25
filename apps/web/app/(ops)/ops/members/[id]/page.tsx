'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type { OpsMember, Service } from '@/types/api';
import { MEMBER_TIERS, MEMBER_TIER_LABELS, type MemberTier } from '@expertly/utils';
const RENEWAL_MONTHS = [3, 6, 12, 24];

interface CredentialForm {
  name: string;
  issuingBody: string;
  year: string;
  url: string;
}

const EMPTY_CREDENTIAL: CredentialForm = { name: '', issuingBody: '', year: '', url: '' };

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [credentialForm, setCredentialForm] = useState<CredentialForm>(EMPTY_CREDENTIAL);
  const [selectedTier, setSelectedTier] = useState('');
  const [renewMonths, setRenewMonths] = useState(12);
  const [serviceChangeId, setServiceChangeId] = useState('');

  const { data: member, isLoading } = useQuery({
    queryKey: queryKeys.ops.member(id),
    queryFn: () => apiClient.get<OpsMember>(`/ops/members/${id}`),
    enabled: !!id,
  });

  // Initialise tier from fetched data (React Query v5 — no onSuccess)
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
      apiClient.post(`/ops/members/${id}/renew`, { months: renewMonths }),
    onSuccess: invalidate,
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
          {member.profilePhotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.profilePhotoUrl}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {[member.firstName, member.lastName].filter(Boolean).join(' ') || member.slug}
            </h2>
            <p className="text-sm text-slate-500">
              {member.designation} · {member.slug}
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
          {/* Bio */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Profile
            </h4>
            {member.headline && (
              <p className="font-medium text-slate-900 mb-2">{member.headline}</p>
            )}
            {member.bio && (
              <p className="text-sm text-slate-600 leading-relaxed">{member.bio}</p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <span>{member.city}, {member.country}</span>
              {member.linkedinUrl && (
                <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  LinkedIn ↗
                </a>
              )}
            </div>
          </div>

          {/* Membership info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Membership
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Tier</p>
                <p className="font-medium text-slate-900">{member.membershipTier ? (MEMBER_TIER_LABELS[member.membershipTier as MemberTier] ?? member.membershipTier) : '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Status</p>
                <p className={`font-medium ${member.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {member.status ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Expires</p>
                <p className={`font-medium ${isExpiring ? 'text-red-600' : 'text-slate-900'}`}>
                  {member.membershipExpiryAt
                    ? new Date(member.membershipExpiryAt).toLocaleDateString()
                    : '—'}
                  {isExpiring && ' ⚠'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Member since</p>
                <p className="font-medium text-slate-900">
                  {new Date(member.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Credentials */}
          {member.credentials && member.credentials.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Credentials
              </h4>
              <div className="space-y-2">
                {member.credentials.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className={`text-xs ${c.isVerified ? 'text-green-600' : 'text-slate-400'}`}>
                      {c.isVerified ? '✓' : '○'}
                    </span>
                    <div>
                      <p className="text-sm text-slate-900">{c.name}</p>
                      {c.issuingBody && (
                        <p className="text-xs text-slate-500">
                          {c.issuingBody} {c.year ? `· ${c.year}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right panel — actions */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </h4>

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
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Change Tier
            </h4>
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
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Trigger Service Change
            </h4>
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
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Renew Membership
            </h4>
            <div className="flex gap-2">
              {RENEWAL_MONTHS.map((mo) => (
                <button
                  key={mo}
                  onClick={() => setRenewMonths(mo)}
                  className={`flex-1 text-xs py-1.5 rounded-md border transition-colors ${
                    renewMonths === mo
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-300 text-slate-700 hover:border-blue-400'
                  }`}
                >
                  {mo}mo
                </button>
              ))}
            </div>
            <button
              onClick={() => renewMutation.mutate()}
              disabled={renewMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {renewMutation.isPending ? 'Renewing…' : `Renew for ${renewMonths} months`}
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
