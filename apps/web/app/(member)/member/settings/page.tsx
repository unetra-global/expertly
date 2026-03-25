'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Mail } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type {
  MemberMe,
  NotificationPreferences,
  Category,
  DigestSubscription,
} from '@/types/api';

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({
  checked, onChange, label, description,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-brand-text">{label}</p>
        {description && <p className="text-xs text-brand-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/30 ${checked ? 'bg-brand-blue' : 'bg-slate-200'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white bg-green-600">
      <CheckCircle className="w-4 h-4" />
      {message}
    </div>
  );
}

// ── Format date ───────────────────────────────────────────────────────────────

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Member profile (for membership info + notification prefs) ──────────────

  const { data: profile } = useQuery({
    queryKey: queryKeys.members.me(),
    queryFn: () => apiClient.get<MemberMe>('/members/me'),
    staleTime: 30_000,
  });

  // ── Notification preferences ───────────────────────────────────────────────

  const defaultPrefs: NotificationPreferences = {
    consultationRequests: true,
    articleStatus: true,
    membershipReminders: true,
    regulatoryNudges: true,
    platformUpdates: true,
  };

  const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPrefs);

  useEffect(() => {
    if (profile?.notificationPreferences) {
      setPrefs(profile.notificationPreferences);
    }
  }, [profile]);

  const notifMutation = useMutation({
    mutationFn: (updated: NotificationPreferences) =>
      apiClient.patch('/members/me/notifications', updated),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.members.me() });
      showToast('Notification preferences saved.');
    },
  });

  const handleTogglePref = (key: keyof NotificationPreferences, val: boolean) => {
    const updated = { ...prefs, [key]: val };
    setPrefs(updated);
    notifMutation.mutate(updated);
  };

  const NOTIF_OPTIONS: Array<{
    key: keyof NotificationPreferences;
    label: string;
    description: string;
  }> = [
    {
      key: 'consultationRequests',
      label: 'Consultation requests',
      description: 'Email when someone sends you a consultation request.',
    },
    {
      key: 'articleStatus',
      label: 'Article status updates',
      description: 'Email when your article is approved or rejected.',
    },
    {
      key: 'membershipReminders',
      label: 'Membership reminders',
      description: 'Reminders 30 days before your membership expires.',
    },
    {
      key: 'regulatoryNudges',
      label: 'Regulatory update nudges',
      description: 'Prompt to write about relevant regulatory changes.',
    },
    {
      key: 'platformUpdates',
      label: 'Platform updates',
      description: 'News and feature announcements from Expertly.',
    },
  ];

  // ── Digest subscriptions ───────────────────────────────────────────────────

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.taxonomy.categories(),
    queryFn: () => apiClient.get<Category[]>('/taxonomy/categories'),
    staleTime: 3600_000,
  });

  const { data: rawDigests = [] } = useQuery({
    queryKey: queryKeys.notifications.digests(),
    queryFn: () => apiClient.get<DigestSubscription[]>('/members/me/digests'),
    staleTime: 30_000,
  });

  // Merge categories with subscription state (fallback if endpoint missing)
  const [digests, setDigests] = useState<DigestSubscription[]>([]);

  useEffect(() => {
    if (rawDigests.length > 0) {
      setDigests(rawDigests);
    } else if (categories.length > 0) {
      setDigests(
        categories.map((cat) => ({
          categoryId: cat.id,
          categoryName: cat.name,
          isSubscribed: cat.id === profile?.services?.categories?.id,
          frequency: 'weekly' as const,
        })),
      );
    }
  }, [categories, rawDigests, profile]);

  const digestMutation = useMutation({
    mutationFn: (subs: DigestSubscription[]) =>
      apiClient.patch('/members/me/digests', {
        subscriptions: subs.map((s) => ({
          categoryId: s.categoryId,
          isSubscribed: s.isSubscribed,
          frequency: s.frequency,
        })),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.digests() });
      showToast('Digest subscriptions saved.');
    },
  });

  const updateDigest = (categoryId: string, changes: Partial<DigestSubscription>) => {
    const updated = digests.map((d) =>
      d.categoryId === categoryId ? { ...d, ...changes } : d,
    );
    setDigests(updated);
    digestMutation.mutate(updated);
  };

  // ── Membership tier label ──────────────────────────────────────────────────

  const tierLabel: Record<string, string> = {
    associate: 'Associate',
    fellow: 'Fellow',
    senior_fellow: 'Senior Fellow',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {toast && <Toast message={toast} />}

      <div>
        <h1 className="text-2xl font-bold text-brand-text">Settings</h1>
        <p className="text-sm text-brand-text-secondary mt-1">Manage your notifications, digest subscriptions, and membership.</p>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-base font-semibold text-brand-text mb-1">Notification Preferences</h2>
        <p className="text-sm text-brand-text-muted mb-4">Changes are saved automatically on toggle.</p>

        <div className="divide-y divide-slate-100">
          {NOTIF_OPTIONS.map((opt) => (
            <Toggle
              key={opt.key}
              checked={prefs[opt.key]}
              onChange={(val) => handleTogglePref(opt.key, val)}
              label={opt.label}
              description={opt.description}
            />
          ))}
        </div>
      </div>

      {/* Digest Subscriptions */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-base font-semibold text-brand-text mb-1">Digest Subscriptions</h2>
        <p className="text-sm text-brand-text-muted mb-4">
          Subscribe to weekly or fortnightly digests of new articles by category. Sent on Monday mornings.
        </p>

        {digests.length === 0 ? (
          <p className="text-sm text-brand-text-muted py-4 text-center">No categories available.</p>
        ) : (
          <div className="space-y-4">
            {digests.map((digest) => (
              <div key={digest.categoryId} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-4 flex-1">
                  {/* Subscribe toggle */}
                  <button
                    role="switch"
                    aria-checked={digest.isSubscribed}
                    onClick={() => updateDigest(digest.categoryId, { isSubscribed: !digest.isSubscribed })}
                    className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${digest.isSubscribed ? 'bg-brand-blue' : 'bg-slate-200'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${digest.isSubscribed ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                  <span className="text-sm font-medium text-brand-text">{digest.categoryName}</span>
                </div>

                {/* Frequency selector — only visible when subscribed */}
                {digest.isSubscribed && (
                  <select
                    value={digest.frequency}
                    onChange={(e) => updateDigest(digest.categoryId, { frequency: e.target.value as 'weekly' | 'fortnightly' })}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Membership */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-base font-semibold text-brand-text mb-4">Membership</h2>
        <dl className="space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-brand-text-muted">Tier</dt>
            <dd className="text-sm font-medium text-brand-text">
              {tierLabel[profile?.membershipTier ?? ''] ?? profile?.membershipTier ?? '—'}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-brand-text-muted">Status</dt>
            <dd>
              {profile?.isVerified ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
                  <CheckCircle className="w-4 h-4" /> Active &amp; Verified
                </span>
              ) : (
                <span className="text-sm font-medium text-amber-700">Active — not yet verified</span>
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-brand-text-muted">Expiry date</dt>
            <dd className="text-sm font-medium text-brand-text">
              {formatDate(profile?.membershipExpiryAt)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-sm text-brand-text-secondary mb-3">
            To renew your membership or discuss tier upgrades, contact our team.
          </p>
          <a
            href="mailto:ops@expertly.net?subject=Membership%20Renewal"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-brand-surface-alt transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact ops@expertly.net
          </a>
        </div>
      </div>
    </div>
  );
}
