'use client';

import { useRef, useState, useEffect } from 'react';
import { State, City } from 'country-state-city';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { getBrowserClient } from '@/lib/supabase';
import { apiClient } from '@/lib/apiClient';
import {
  REGIONS,
  COUNTRIES_BY_REGION,
  COUNTRY_TO_REGION,
  COUNTRY_NAMES,
  NAME_TO_CODE,
  PHONE_CODES,
} from '@expertly/utils';

// ── Derived: region → country name[] (for dropdown options) ──────────────────

const COUNTRIES_BY_REGION_NAMES: Record<string, string[]> = Object.fromEntries(
  Object.entries(COUNTRIES_BY_REGION).map(([region, countries]) => [region, countries.map((c) => c.name)]),
);

// ── LinkedIn response → store shape ───────────────────────────────────────────

const MONTH_NUM: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

function liDate(d: { month?: string; year?: number } | null | undefined): string {
  if (!d?.year) return '';
  const m = d.month ? (MONTH_NUM[d.month] ?? '01') : '01';
  return `${d.year}-${m}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseLinkedInResponse(raw: any, profileUrl: string): import('@/stores/onboardingStore').LinkedInPrefillResult {
  return {
    firstName: raw.firstName ?? '',
    lastName: raw.lastName ?? '',
    headline: raw.headline ?? '',
    bio: raw.about ?? '',
    linkedinUrl: raw.linkedinUrl ?? profileUrl,
    designation: raw.experience?.[0]?.position ?? '',
    profilePhotoUrl: raw.photo ?? raw.profilePicture?.url ?? '',
    city: raw.location?.parsed?.city ?? '',
    country: raw.location?.parsed?.country ?? '',
    state: raw.location?.parsed?.state ?? '',
    experience: (raw.experience ?? []).slice(0, 5).map((e: any) => ({
      firm: e.companyName ?? '',
      title: e.position ?? '',
      startDate: liDate(e.startDate),
      endDate: e.endDate?.text === 'Present' ? '' : liDate(e.endDate),
      isCurrent: e.endDate?.text === 'Present',
      city: e.location?.split(',')[0]?.trim() ?? '',
    })),
    education: (raw.education ?? []).slice(0, 3).map((e: any) => ({
      institution: e.schoolName ?? '',
      degree: e.degree ?? '',
      field: e.fieldOfStudy ?? '',
      startYear: e.startDate?.year ?? '',
      endYear: e.endDate?.year ?? '',
    })),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  onNext: () => void;
}

type ToastState = { message: string; type: 'success' | 'error' } | null;

export function Step1Identity({ onNext }: Props) {
  const { formData, setStep1, applyLinkedInPrefill } = useOnboardingStore();

  const [photoPreview, setPhotoPreview] = useState<string>(formData.profilePhotoBase64);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [linkedinUrlInput, setLinkedinUrlInput] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Local form state
  const [fields, setFields] = useState({
    firstName: formData.firstName,
    lastName: formData.lastName,
    phoneExtension: formData.phoneExtension || '+1',
    phone: formData.phone,
    contactEmail: formData.contactEmail,
    region: formData.region,
    country: formData.country,
    state: formData.state,
    city: formData.city,
    linkedinUrl: formData.linkedinUrl,
    headline: formData.headline,
    bio: formData.bio,
  });

  // States available for selected country (from country-state-city library)
  const [availableStates, setAvailableStates] = useState<{ name: string; isoCode: string }[]>(() => {
    const iso = NAME_TO_CODE[formData.country];
    return iso ? State.getStatesOfCountry(iso) : [];
  });

  // Cities available for selected state
  const [availableCities, setAvailableCities] = useState<{ name: string }[]>(() => {
    const iso = NAME_TO_CODE[formData.country];
    if (!iso || !formData.state) return [];
    const st = State.getStatesOfCountry(iso).find((s) => s.name === formData.state);
    return st ? City.getCitiesOfState(iso, st.isoCode) : [];
  });

  // Pre-populate email from auth session (non-destructive)
  useEffect(() => {
    if (fields.contactEmail) return;
    getBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        const email = data.user?.email;
        if (email) setFields((f) => ({ ...f, contactEmail: email }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync fields when LinkedIn prefill populates the store
  useEffect(() => {
    setFields((f) => ({
      firstName: formData.firstName || f.firstName,
      lastName: formData.lastName || f.lastName,
      phoneExtension: formData.phoneExtension || f.phoneExtension,
      phone: formData.phone || f.phone,
      contactEmail: formData.contactEmail || f.contactEmail,
      region: formData.region || f.region,
      country: formData.country || f.country,
      state: formData.state || f.state,
      city: formData.city || f.city,
      linkedinUrl: formData.linkedinUrl || f.linkedinUrl,
      headline: formData.headline || f.headline,
      bio: formData.bio || f.bio,
    }));
    if (formData.profilePhotoBase64) setPhotoPreview(formData.profilePhotoBase64);
  }, [formData]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  function updateField(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  function handleRegionChange(region: string) {
    const countries = COUNTRIES_BY_REGION_NAMES[region] ?? [];
    setFields((f) => ({
      ...f,
      region,
      country: countries.includes(f.country) ? f.country : '',
      state: '',
      city: '',
    }));
    setAvailableStates([]);
    setAvailableCities([]);
    setErrors((e) => ({ ...e, region: '', country: '', state: '', city: '' }));
  }

  function handleCountryChange(country: string) {
    const iso = NAME_TO_CODE[country];
    const states = iso ? State.getStatesOfCountry(iso) : [];
    setAvailableStates(states);
    setAvailableCities([]);
    const autoRegion = COUNTRY_TO_REGION[country] ?? '';
    setFields((f) => ({ ...f, country, state: '', city: '', region: f.region || autoRegion }));
    setErrors((e) => ({ ...e, country: '', state: '', city: '' }));
  }

  function handleStateChange(stateName: string) {
    const iso = NAME_TO_CODE[fields.country];
    const st = availableStates.find((s) => s.name === stateName);
    const cities = iso && st ? City.getCitiesOfState(iso, st.isoCode) : [];
    setAvailableCities(cities);
    setFields((f) => ({ ...f, state: stateName, city: '' }));
    setErrors((e) => ({ ...e, state: '', city: '' }));
  }

  // ── Photo upload ─────────────────────────────────────────────────────────────
  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show a local preview immediately while uploading
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await apiClient.upload<{ base64: string }>('/upload/avatar', fd);
      if (result?.base64) {
        setStep1({ profilePhotoBase64: result.base64 });
        setPhotoPreview(result.base64);
      }
    } catch {
      setPhotoPreview(formData.profilePhotoBase64);
      setToast({ message: 'Photo upload failed. Please try again.', type: 'error' });
    } finally {
      setPhotoUploading(false);
    }
  }

  // ── LinkedIn import ───────────────────────────────────────────────────────────
  async function handleLinkedInImport() {
    const url = linkedinUrlInput.trim();
    if (!url || !/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i.test(url)) {
      setToast({ message: 'Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourname)', type: 'error' });
      return;
    }
    setShowImportDialog(false);
    setLinkedinLoading(true);
    try {
      const res = await fetch(
        'https://n8n.unetraglobal.com/webhook/e3842ccc-130b-4170-b465-3188386e6298',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileUrl: url }),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await res.json();
      // Response is always an array — take first element
      const raw = Array.isArray(data) ? data[0] : data;
      const prefill = parseLinkedInResponse(raw, url);
      applyLinkedInPrefill(prefill);

      // Convert the LinkedIn photo URL → base64 via backend (avoids CORS)
      if (prefill.profilePhotoUrl) {
        try {
          const b64 = await apiClient.post<{ base64: string }>('/upload/avatar-from-url', { url: prefill.profilePhotoUrl });
          if (b64?.base64) {
            // Store base64 and use it as the photo preview
            setStep1({ profilePhotoBase64: b64.base64 });
            setPhotoPreview(b64.base64);
          }
        } catch {
          // Non-fatal — photo preview still shows via URL; base64 just won't be stored
        }
      }

      setToast({ message: 'LinkedIn profile imported! Review and edit your details below.', type: 'success' });
    } catch {
      setToast({ message: 'Import failed. Please check the URL and try again.', type: 'error' });
    } finally {
      setLinkedinLoading(false);
    }
  }

  // ── Validation + Next ─────────────────────────────────────────────────────────
  function handleNext() {
    setStep1({ ...fields });

    const errs: Record<string, string> = {};
    if (!fields.firstName.trim()) errs.firstName = 'First name is required';
    if (!fields.lastName.trim()) errs.lastName = 'Last name is required';
    if (!fields.contactEmail.trim()) {
      errs.contactEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.contactEmail.trim())) {
      errs.contactEmail = 'Enter a valid email address';
    }
    if (!fields.region) errs.region = 'Region is required';
    if (!fields.country) errs.country = 'Country is required';
    if (!fields.linkedinUrl.trim()) {
      errs.linkedinUrl = 'LinkedIn URL is required';
    } else if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i.test(fields.linkedinUrl.trim())) {
      errs.linkedinUrl = 'Enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/yourname)';
    }
    if (!fields.bio.trim()) errs.bio = 'Bio is required';
    if (!formData.profilePhotoBase64) errs.photo = 'Profile photo is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onNext();
  }

  const initials = (fields.firstName?.[0] ?? '') + (fields.lastName?.[0] ?? '') || 'You';

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
            }`}
        >
          {toast.type === 'success' ? (
            <svg className="h-4 w-4 shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-brand-navy">Your Identity</h2>
          <button
            type="button"
            onClick={() => { setLinkedinUrlInput(''); setShowImportDialog(true); }}
            disabled={linkedinLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0077B5] hover:bg-[#006097] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Import from LinkedIn
          </button>
        </div>

        {/* Profile photo */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-brand-navy flex items-center justify-center overflow-hidden border-2 border-gray-100 shrink-0">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xl">{initials}</span>
              )}
            </div>
            {photoUploading && (
              <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-navy mb-1">
              Profile photo <span className="text-red-500">*</span>
            </p>
            <p className="text-xs text-brand-text-muted mb-2">JPEG or PNG, max 5 MB. Displayed square.</p>
            <button
              type="button"
              onClick={() => { photoInputRef.current?.click(); setErrors((e) => ({ ...e, photo: '' })); }}
              disabled={photoUploading}
              className="text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors disabled:opacity-50"
            >
              {photoPreview ? 'Change photo' : 'Upload photo'}
            </button>
            {errors.photo && <p className="mt-1 text-xs text-red-500">{errors.photo}</p>}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => void handlePhotoChange(e)}
            />
          </div>
        </div>

        {/* ── 1. Name ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fields.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              placeholder="Jane"
              className={`input-base w-full ${errors.firstName ? 'border-red-300 focus:ring-red-200' : ''}`}
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fields.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              placeholder="Smith"
              className={`input-base w-full ${errors.lastName ? 'border-red-300 focus:ring-red-200' : ''}`}
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        {/* ── 2. Phone ── */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
            WhatsApp / Phone
          </label>
          <div className="flex gap-2">
            <select
              value={fields.phoneExtension}
              onChange={(e) => updateField('phoneExtension', e.target.value)}
              className="input-base w-36 shrink-0"
            >
              {PHONE_CODES.map((p) => (
                <option key={p.code} value={p.code}>{p.label}</option>
              ))}
            </select>
            <input
              type="tel"
              value={fields.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="7700 900 000"
              className="input-base flex-1 min-w-0"
            />
          </div>
        </div>

        {/* ── 3. Contact email ── */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
            Contact email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={fields.contactEmail}
            onChange={(e) => updateField('contactEmail', e.target.value)}
            placeholder="you@example.com"
            className={`input-base w-full ${errors.contactEmail ? 'border-red-300 focus:ring-red-200' : ''}`}
          />
          {errors.contactEmail && <p className="mt-1 text-xs text-red-500">{errors.contactEmail}</p>}
        </div>

        {/* ── 4. Region + Country ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
              Region <span className="text-red-500">*</span>
            </label>
            <select
              value={fields.region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className={`input-base w-full ${errors.region ? 'border-red-300 focus:ring-red-200' : ''}`}
            >
              <option value="">Select region</option>
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.region && <p className="mt-1 text-xs text-red-500">{errors.region}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              value={fields.country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className={`input-base w-full ${errors.country ? 'border-red-300 focus:ring-red-200' : ''}`}
            >
              <option value="">Select country</option>
              {(fields.region ? COUNTRIES_BY_REGION_NAMES[fields.region] ?? [] : COUNTRY_NAMES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
          </div>
        </div>

        {/* ── 5. State + City ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
              State / Province
            </label>
            {availableStates.length > 0 ? (
              <select
                value={fields.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="input-base w-full"
              >
                <option value="">Select state</option>
                {availableStates.map((s) => (
                  <option key={s.isoCode} value={s.name}>{s.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={fields.state}
                onChange={(e) => updateField('state', e.target.value)}
                placeholder="e.g. California"
                className="input-base w-full"
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
              City
            </label>
            {availableCities.length > 0 ? (
              <select
                value={fields.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="input-base w-full"
              >
                <option value="">Select city</option>
                {availableCities.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={fields.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="e.g. London"
                className="input-base w-full"
              />
            )}
          </div>
        </div>

        {/* ── 7. LinkedIn URL ── */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
            LinkedIn URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={fields.linkedinUrl}
            onChange={(e) => updateField('linkedinUrl', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className={`input-base w-full ${errors.linkedinUrl ? 'border-red-300 focus:ring-red-200' : ''}`}
          />
          {errors.linkedinUrl && <p className="mt-1 text-xs text-red-500">{errors.linkedinUrl}</p>}
        </div>

        {/* ── 10. Professional bio ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-brand-text-secondary">
              Professional bio <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs ${fields.bio.length > 460 ? 'text-amber-500' : 'text-brand-text-muted'}`}>
              {fields.bio.length}/500
            </span>
          </div>
          <textarea
            value={fields.bio}
            onChange={(e) => updateField('bio', e.target.value.slice(0, 500))}
            placeholder="Describe your professional background, expertise, and what makes you uniquely qualified…"
            rows={4}
            className={`input-base w-full resize-none ${errors.bio ? 'border-red-300 focus:ring-red-200' : ''}`}
          />
          {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio}</p>}
        </div>
      </div>

      {/* Error summary */}
      {Object.values(errors).some(Boolean) && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>Some required fields are incomplete or invalid — scroll up to fix them before continuing.</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="btn-primary px-8 py-3 text-base"
        >
          Next: Experience
          <svg className="ml-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* LinkedIn loading card */}
      {linkedinLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 px-8 py-6 flex items-center gap-5 max-w-sm w-full">
            <div className="relative shrink-0">
              <svg className="animate-spin h-10 w-10 text-[#0077B5]/20" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
              </svg>
              <svg className="animate-spin h-10 w-10 text-[#0077B5] absolute inset-0" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="h-4 w-4 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-navy">Importing from LinkedIn</p>
              <p className="text-xs text-brand-text-muted mt-0.5">Fetching your profile data…</p>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn import dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-[#0077B5]/10 border border-[#0077B5]/20 flex items-center justify-center mb-5">
              <svg className="h-6 w-6 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-brand-navy mb-2">Import from LinkedIn</h3>
            <p className="text-sm text-brand-text-secondary mb-5">
              Paste your LinkedIn profile URL and we&apos;ll auto-fill your name, headline, bio, work experience, education, and more.
            </p>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
              LinkedIn Profile URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={linkedinUrlInput}
              onChange={(e) => setLinkedinUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleLinkedInImport(); }}
              placeholder="https://www.linkedin.com/in/yourname"
              className="input-base w-full mb-1"
              autoFocus
            />
            <p className="text-xs text-brand-text-muted mb-6">e.g. https://www.linkedin.com/in/janesmith</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowImportDialog(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-brand-text hover:bg-brand-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleLinkedInImport()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white text-sm font-semibold transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
