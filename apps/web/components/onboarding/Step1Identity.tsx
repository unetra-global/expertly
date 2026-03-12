'use client';

import { useRef, useState, useEffect } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { getBrowserClient } from '@/lib/supabase';
import { apiClient } from '@/lib/apiClient';
import type { LinkedInPrefillResult } from '@/stores/onboardingStore';


interface Props {
  onNext: () => void;
}

type ToastState = { message: string; type: 'success' | 'error' } | null;

export function Step1Identity({ onNext }: Props) {
  const { formData, setStep1, applyLinkedInPrefill } = useOnboardingStore();

  const [photoPreview, setPhotoPreview] = useState<string>(formData.profilePhotoUrl);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const photoInputRef = useRef<HTMLInputElement>(null);
  const realtimeCleanupRef = useRef<(() => void) | null>(null);

  // Local form state (uncontrolled via store)
  const [fields, setFields] = useState({
    firstName: formData.firstName,
    lastName: formData.lastName,
    designation: formData.designation,
    headline: formData.headline,
    bio: formData.bio,
    linkedinUrl: formData.linkedinUrl,
  });

  // Sync from store if LinkedIn prefill updates it
  useEffect(() => {
    setFields({
      firstName: formData.firstName,
      lastName: formData.lastName,
      designation: formData.designation,
      headline: formData.headline,
      bio: formData.bio,
      linkedinUrl: formData.linkedinUrl,
    });
    if (formData.profilePhotoUrl) setPhotoPreview(formData.profilePhotoUrl);
  }, [formData]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // Cleanup realtime on unmount
  useEffect(() => {
    return () => realtimeCleanupRef.current?.();
  }, []);

  function updateField(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  // ── Photo upload ─────────────────────────────────────────────────────────────
  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate preview
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await apiClient.upload<{ url: string }>('/upload/avatar', fd);
      if (result?.url) {
        setStep1({ profilePhotoUrl: result.url });
        setPhotoPreview(result.url);
      }
    } catch {
      setPhotoPreview(formData.profilePhotoUrl); // revert
      setToast({ message: 'Photo upload failed. Please try again.', type: 'error' });
    } finally {
      setPhotoUploading(false);
    }
  }

  // ── LinkedIn import ───────────────────────────────────────────────────────────
  async function handleLinkedInImport() {
    setShowConsent(false);
    setLinkedinLoading(true);
    try {
      const result = await apiClient.post<{ jobId: string }>('/automation/linkedin-scrape', {});
      const jobId = result.jobId;

      // Subscribe to Supabase Realtime for job updates
      const supabase = getBrowserClient();
      const channel = supabase
        .channel(`job-${jobId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'background_jobs',
            filter: `id=eq.${jobId}`,
          },
          (payload) => {
            const job = payload.new as { status: string; result?: Record<string, unknown> };
            if (job.status === 'completed') {
              cleanup();
              const prefillData = job.result as LinkedInPrefillResult | undefined;
              if (prefillData) {
                applyLinkedInPrefill(prefillData);
              }
              setLinkedinLoading(false);
              setToast({ message: 'LinkedIn data imported. Review your details below.', type: 'success' });
            } else if (job.status === 'failed') {
              cleanup();
              setLinkedinLoading(false);
              setToast({ message: 'Failed to import from LinkedIn. Please enter your details manually.', type: 'error' });
            }
          },
        )
        .subscribe();

      function cleanup() {
        void supabase.removeChannel(channel);
        realtimeCleanupRef.current = null;
      }

      realtimeCleanupRef.current = cleanup;

      // Timeout after 2 minutes
      setTimeout(() => {
        if (realtimeCleanupRef.current) {
          cleanup();
          setLinkedinLoading(false);
          setToast({ message: 'LinkedIn import timed out. Please fill in your details manually.', type: 'error' });
        }
      }, 120_000);
    } catch {
      setLinkedinLoading(false);
      setToast({ message: 'Failed to start LinkedIn import. Please try again.', type: 'error' });
    }
  }

  // ── Validation + Next ─────────────────────────────────────────────────────────
  function handleNext() {
    // Save to store first
    setStep1({ ...fields });

    const errs: Record<string, string> = {};
    if (!fields.firstName.trim()) errs.firstName = 'First name is required';
    if (!fields.lastName.trim()) errs.lastName = 'Last name is required';
    if (!fields.designation.trim()) errs.designation = 'Designation is required';
    if (!fields.headline.trim()) errs.headline = 'Headline is required';
    if (!fields.bio.trim()) errs.bio = 'Bio is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onNext();
  }

  const initials =
    (fields.firstName?.[0] ?? '') + (fields.lastName?.[0] ?? '') || 'You';

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${
            toast.type === 'success'
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

          {/* LinkedIn Import button */}
          <button
            type="button"
            onClick={() => !linkedinLoading && setShowConsent(true)}
            disabled={linkedinLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0077B5] hover:bg-[#006097] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 transition-colors"
          >
            {linkedinLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Importing…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Import from LinkedIn
              </>
            )}
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
            <p className="text-sm font-semibold text-brand-navy mb-1">Profile photo</p>
            <p className="text-xs text-brand-text-muted mb-2">JPEG or PNG, max 5 MB. Displayed square.</p>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={photoUploading}
              className="text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors disabled:opacity-50"
            >
              {photoPreview ? 'Change photo' : 'Upload photo'}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => void handlePhotoChange(e)}
            />
          </div>
        </div>

        {/* Name row */}
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

        {/* Designation */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
            Designation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fields.designation}
            onChange={(e) => updateField('designation', e.target.value)}
            placeholder="e.g. Partner, Tax Advisory"
            className={`input-base w-full ${errors.designation ? 'border-red-300 focus:ring-red-200' : ''}`}
          />
          {errors.designation && <p className="mt-1 text-xs text-red-500">{errors.designation}</p>}
        </div>

        {/* Headline */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-brand-text-secondary">
              Professional headline <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs ${fields.headline.length > 110 ? 'text-amber-500' : 'text-brand-text-muted'}`}>
              {fields.headline.length}/120
            </span>
          </div>
          <input
            type="text"
            value={fields.headline}
            onChange={(e) => updateField('headline', e.target.value.slice(0, 120))}
            placeholder="e.g. Cross-border M&A specialist with 15+ years experience"
            className={`input-base w-full ${errors.headline ? 'border-red-300 focus:ring-red-200' : ''}`}
          />
          {errors.headline && <p className="mt-1 text-xs text-red-500">{errors.headline}</p>}
        </div>

        {/* Bio */}
        <div className="mb-4">
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

        {/* LinkedIn URL */}
        <div>
          <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
            LinkedIn URL <span className="text-brand-text-muted font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={fields.linkedinUrl}
            onChange={(e) => updateField('linkedinUrl', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className="input-base w-full"
          />
        </div>
      </div>

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

      {/* LinkedIn consent dialog */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-[#0077B5]/10 border border-[#0077B5]/20 flex items-center justify-center mb-5">
              <svg className="h-6 w-6 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-brand-navy mb-2">Import from LinkedIn</h3>
            <p className="text-sm text-brand-text-secondary leading-relaxed mb-4">
              We will fetch your public LinkedIn profile data to pre-fill this form.
              You can edit any field after import. We never post to LinkedIn without your permission.
            </p>
            <ul className="space-y-2 mb-6">
              {[
                'Name and profile photo',
                'Headline and bio',
                'Work experience history',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-brand-text-secondary">
                  <svg className="h-3.5 w-3.5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConsent(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-brand-text hover:bg-brand-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleLinkedInImport()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white text-sm font-semibold transition-colors"
              >
                Agree & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
