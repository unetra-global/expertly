'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { apiClient } from '@/lib/apiClient';
import type { EngagementEntry } from '@/stores/onboardingStore';
import type { Service as TaxonomyService } from '@/types/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (8am–12pm)' },
  { id: 'afternoon', label: 'Afternoon (12pm–5pm)' },
  { id: 'evening', label: 'Evening (5pm–8pm)' },
];
const CONTACT_METHODS = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'video', label: 'Video call' },
];
const RESPONSE_TIMES = [
  { id: '24h', label: 'Within 24 hours' },
  { id: '48h', label: 'Within 48 hours' },
  { id: '1week', label: 'Within 1 week' },
];
const ENGAGEMENT_TYPES = [
  { id: 'speaking', label: 'Speaking' },
  { id: 'publication', label: 'Publication' },
  { id: 'award', label: 'Award' },
  { id: 'media', label: 'Media' },
] as const;

const TIMEZONES = [
  'Africa/Lagos', 'Africa/Nairobi', 'Africa/Johannesburg',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Toronto',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Tokyo', 'Asia/Riyadh',
  'Australia/Sydney', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Pacific/Auckland',
];

type ToastState = { message: string; type: 'success' | 'error' } | null;

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

interface Props {
  onBack: () => void;
}

export function Step3Services({ onBack }: Props) {
  const router = useRouter();
  const { formData, setStep3, setApplicationId, setIsSubmitting, applicationId, isSubmitting } = useOnboardingStore();

  const [toast, setToast] = useState<ToastState>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Local state
  const [primaryServiceId, setPrimaryServiceId] = useState(formData.primaryServiceId);
  const [secondaryServiceIds, setSecondaryServiceIds] = useState<string[]>(formData.secondaryServiceIds);
  const [engagements, setEngagements] = useState<EngagementEntry[]>(formData.engagements);
  const [availability, setAvailability] = useState(formData.availability);
  const [consentTerms, setConsentTerms] = useState(formData.consentTerms);
  const [consentVerification, setConsentVerification] = useState(formData.consentVerification);

  // Fetch services taxonomy
  const { data: services = [] } = useQuery<TaxonomyService[]>({
    queryKey: ['services'],
    queryFn: () => apiClient.get<TaxonomyService[]>('/taxonomy/services'),
    staleTime: 3600_000,
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Availability helpers ────────────────────────────────────────────────────
  function toggleDay(day: string) {
    setAvailability((a) => ({
      ...a,
      days: a.days.includes(day) ? a.days.filter((d) => d !== day) : [...a.days, day],
    }));
  }
  function toggleSlot(slot: string) {
    setAvailability((a) => ({
      ...a,
      timeSlots: a.timeSlots.includes(slot) ? a.timeSlots.filter((s) => s !== slot) : [...a.timeSlots, slot],
    }));
  }
  function toggleContact(method: string) {
    setAvailability((a) => ({
      ...a,
      preferredContact: a.preferredContact.includes(method)
        ? a.preferredContact.filter((m) => m !== method)
        : [...a.preferredContact, method],
    }));
  }

  // ── Engagements ─────────────────────────────────────────────────────────────
  function addEngagement() {
    if (engagements.length >= 5) return;
    setEngagements((e) => [
      ...e,
      { id: genId(), type: 'speaking', title: '', organization: '', year: '', url: '' },
    ]);
  }
  function updateEngagement(id: string, key: keyof EngagementEntry, value: string | number | '') {
    setEngagements((e) => e.map((en) => en.id === id ? { ...en, [key]: value } : en));
  }
  function removeEngagement(id: string) {
    setEngagements((e) => e.filter((en) => en.id !== id));
  }

  // ── Secondary services ──────────────────────────────────────────────────────
  function toggleSecondary(id: string) {
    if (secondaryServiceIds.includes(id)) {
      setSecondaryServiceIds((s) => s.filter((x) => x !== id));
    } else if (secondaryServiceIds.length < 3) {
      setSecondaryServiceIds((s) => [...s, id]);
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    // Save to store
    setStep3({
      primaryServiceId,
      secondaryServiceIds,
      engagements,
      availability,
      consentTerms,
      consentVerification,
    });

    const errs: Record<string, string> = {};
    if (!primaryServiceId) errs.primaryService = 'Please select a primary service';
    if (!consentTerms) errs.consentTerms = 'You must agree to the Terms of Service';
    if (!consentVerification) errs.consentVerification = 'You must consent to credential verification';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create or retrieve draft application
      let appId = applicationId;
      if (!appId) {
        const app = await apiClient.post<{ id: string }>('/applications', {});
        appId = app.id;
        setApplicationId(appId);
      }

      const step1Payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        profilePhotoUrl: formData.profilePhotoUrl,
        designation: formData.designation,
        headline: formData.headline,
        bio: formData.bio,
        linkedinUrl: formData.linkedinUrl,
      };
      const step2Payload = {
        yearsOfExperience: formData.yearsOfExperience,
        firmName: formData.firmName,
        firmSize: formData.firmSize,
        country: formData.country,
        city: formData.city,
        consultationFeeMinUsd: formData.consultationFeeMinUsd,
        consultationFeeMaxUsd: formData.consultationFeeMaxUsd,
        qualifications: formData.qualifications,
        credentials: formData.credentials,
        workExperience: formData.workExperience,
        education: formData.education,
      };
      const step3Payload = {
        primaryServiceId,
        secondaryServiceIds,
        engagements,
        availability,
      };

      // 2. PATCH step data
      await Promise.all([
        apiClient.patch(`/applications/${appId}/step-1`, step1Payload),
        apiClient.patch(`/applications/${appId}/step-2`, step2Payload),
        apiClient.patch(`/applications/${appId}/step-3`, step3Payload),
      ]);

      // 3. Submit the application
      await apiClient.post(`/applications/${appId}/submit`, {});

      // 4. Log consents
      await Promise.all([
        apiClient.post('/consent', { type: 'terms_and_privacy', applicationId: appId }),
        apiClient.post('/consent', { type: 'credential_verification', applicationId: appId }),
      ]);

      // 5. Redirect to status page
      router.push('/application/status');
    } catch {
      setToast({ message: 'Submission failed. Please check your connection and try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.message}
        </div>
      )}

      {/* ── Services ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-brand-navy mb-5">Services</h2>

        {/* Primary service */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
            Primary service <span className="text-red-500">*</span>
          </label>
          <select
            value={primaryServiceId}
            onChange={(e) => { setPrimaryServiceId(e.target.value); setErrors((err) => ({ ...err, primaryService: '' })); }}
            className={`input-base w-full ${errors.primaryService ? 'border-red-300' : ''}`}
          >
            <option value="">Select your primary service…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.primaryService && <p className="mt-1 text-xs text-red-500">{errors.primaryService}</p>}
        </div>

        {/* Secondary services */}
        <div>
          <p className="text-xs font-semibold text-brand-text-secondary mb-2">
            Secondary services <span className="text-brand-text-muted font-normal">(optional, max 3)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {services
              .filter((s) => s.id !== primaryServiceId)
              .map((s) => {
                const selected = secondaryServiceIds.includes(s.id);
                const maxed = !selected && secondaryServiceIds.length >= 3;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={maxed}
                    onClick={() => toggleSecondary(s.id)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      selected
                        ? 'bg-brand-blue border-brand-blue text-white'
                        : maxed
                        ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'bg-white border-gray-200 text-brand-text hover:border-brand-blue hover:text-brand-blue'
                    }`}
                  >
                    {s.name}
                    {selected && (
                      <svg className="ml-1.5 h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* ── Engagements ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Professional Engagements</h2>
            <p className="text-xs text-brand-text-muted mt-0.5">Speaking, publications, awards — up to 5</p>
          </div>
          {engagements.length < 5 && (
            <button type="button" onClick={addEngagement} className="btn-outline text-sm px-4 py-2">+ Add</button>
          )}
        </div>
        {engagements.length === 0 ? (
          <p className="text-sm text-brand-text-muted text-center py-4">No engagements added yet.</p>
        ) : (
          <div className="space-y-4">
            {engagements.map((eng) => (
              <div key={eng.id} className="rounded-xl border border-gray-100 bg-brand-surface p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-brand-text-muted mb-1">Type</label>
                    <select
                      value={eng.type}
                      onChange={(e) => updateEngagement(eng.id, 'type', e.target.value)}
                      className="input-base w-full text-sm"
                    >
                      {ENGAGEMENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-brand-text-muted mb-1">Title</label>
                    <input type="text" value={eng.title} onChange={(e) => updateEngagement(eng.id, 'title', e.target.value)} placeholder="Talk or article title" className="input-base w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-text-muted mb-1">Organisation / Publication</label>
                    <input type="text" value={eng.organization} onChange={(e) => updateEngagement(eng.id, 'organization', e.target.value)} placeholder="e.g. TEDx, Forbes" className="input-base w-full text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">Year</label>
                      <input type="number" value={eng.year} onChange={(e) => updateEngagement(eng.id, 'year', e.target.value === '' ? '' : Number(e.target.value))} placeholder="2023" className="input-base w-full text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">URL</label>
                      <input type="url" value={eng.url} onChange={(e) => updateEngagement(eng.id, 'url', e.target.value)} placeholder="https://…" className="input-base w-full text-sm" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => removeEngagement(eng.id)} className="text-xs font-medium text-red-400 hover:text-red-600">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Availability ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h2 className="text-base font-bold text-brand-navy mb-5">Availability</h2>

        {/* Working days */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-brand-text-secondary mb-2">Available days</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  availability.days.includes(day)
                    ? 'bg-brand-blue border-brand-blue text-white'
                    : 'bg-white border-gray-200 text-brand-text hover:border-brand-blue'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Time slots */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-brand-text-secondary mb-2">Time slots</p>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => toggleSlot(slot.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  availability.timeSlots.includes(slot.id)
                    ? 'bg-brand-blue border-brand-blue text-white'
                    : 'bg-white border-gray-200 text-brand-text hover:border-brand-blue'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Timezone */}
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">Timezone</label>
            <select
              value={availability.timezone}
              onChange={(e) => setAvailability((a) => ({ ...a, timezone: e.target.value }))}
              className="input-base w-full"
            >
              <option value="">Select timezone</option>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
            </select>
          </div>

          {/* Response time */}
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">Typical response time</label>
            <select
              value={availability.responseTime}
              onChange={(e) => setAvailability((a) => ({ ...a, responseTime: e.target.value as typeof availability.responseTime }))}
              className="input-base w-full"
            >
              <option value="">Select response time</option>
              {RESPONSE_TIMES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
        </div>

        {/* Preferred contact */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-brand-text-secondary mb-2">Preferred contact methods</p>
          <div className="flex flex-wrap gap-2">
            {CONTACT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleContact(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  availability.preferredContact.includes(m.id)
                    ? 'bg-brand-blue border-brand-blue text-white'
                    : 'bg-white border-gray-200 text-brand-text hover:border-brand-blue'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-brand-text-secondary">Availability notes</label>
            <span className="text-xs text-brand-text-muted">{availability.notes.length}/200</span>
          </div>
          <textarea
            value={availability.notes}
            onChange={(e) => setAvailability((a) => ({ ...a, notes: e.target.value.slice(0, 200) }))}
            placeholder="Any additional availability information…"
            rows={3}
            className="input-base w-full resize-none"
          />
        </div>
      </div>

      {/* ── Consent ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h2 className="text-base font-bold text-brand-navy mb-5">Declaration &amp; Consent</h2>
        <div className="space-y-4">
          <label className={`flex items-start gap-3 cursor-pointer rounded-xl p-3 border transition-colors ${consentTerms ? 'bg-green-50 border-green-200' : errors.consentTerms ? 'bg-red-50 border-red-200' : 'border-gray-100 hover:bg-brand-surface'}`}>
            <input
              type="checkbox"
              checked={consentTerms}
              onChange={(e) => { setConsentTerms(e.target.checked); setErrors((err) => ({ ...err, consentTerms: '' })); }}
              className="mt-0.5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="text-sm text-brand-text-secondary leading-relaxed">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-brand-blue hover:underline font-medium">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" className="text-brand-blue hover:underline font-medium">Privacy Policy</a>.
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
          {errors.consentTerms && <p className="text-xs text-red-500 pl-3">{errors.consentTerms}</p>}

          <label className={`flex items-start gap-3 cursor-pointer rounded-xl p-3 border transition-colors ${consentVerification ? 'bg-green-50 border-green-200' : errors.consentVerification ? 'bg-red-50 border-red-200' : 'border-gray-100 hover:bg-brand-surface'}`}>
            <input
              type="checkbox"
              checked={consentVerification}
              onChange={(e) => { setConsentVerification(e.target.checked); setErrors((err) => ({ ...err, consentVerification: '' })); }}
              className="mt-0.5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="text-sm text-brand-text-secondary leading-relaxed">
              I consent to Expertly verifying my professional credentials and background as part of the membership review process.
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
          {errors.consentVerification && <p className="text-xs text-red-500 pl-3">{errors.consentVerification}</p>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="btn-outline px-6 py-3">
          <svg className="mr-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !consentTerms || !consentVerification}
          className="btn-primary px-8 py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting…
            </>
          ) : (
            'Submit Application'
          )}
        </button>
      </div>
    </div>
  );
}
