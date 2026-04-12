'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { apiClient, ApiError } from '@/lib/apiClient';

interface ServiceItem { id: string; name: string; categoryId?: string; }
interface CategoryItem { id: string; name: string; }

// "2025-10" → "Oct 2025"
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d: string): string {
  if (!d) return '';
  const [year, mon] = d.split('-');
  const m = MONTHS[(Number(mon) || 1) - 1];
  return m ? `${m} ${year}` : (year ?? '');
}

interface Props {
  onBack: () => void;
}

export function Step4Review({ onBack }: Props) {
  const router = useRouter();
  const {
    formData,
    applicationId,
    setApplicationId,
    isSubmitting,
    setIsSubmitting,
  } = useOnboardingStore();

  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentVerification, setConsentVerification] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const { data: services = [] } = useQuery<ServiceItem[]>({
    queryKey: ['services'],
    queryFn: () => apiClient.get<ServiceItem[]>('/taxonomy/services'),
    staleTime: 3600_000,
  });
  const { data: categories = [] } = useQuery<CategoryItem[]>({
    queryKey: ['service-categories'],
    queryFn: () => apiClient.get<CategoryItem[]>('/taxonomy/categories'),
    staleTime: 3600_000,
  });

  const primaryService = services.find((s) => s.id === formData.primaryServiceId);
  const primaryCategory = categories.find((c) => c.id === primaryService?.categoryId);
  const secondaryServices = formData.secondaryServiceIds
    .map((id) => services.find((s) => s.id === id)?.name)
    .filter(Boolean);

  const topCredentials = [
    ...new Set(
      formData.credentials
        .filter((c) => c.abbreviation && !c.uploading)
        .map((c) => c.abbreviation)
        .slice(0, 4),
    ),
  ];

  const primaryExp = formData.workExperience.find((e) => e.isCurrent) ?? formData.workExperience[0];

  async function handleSubmit() {
    const errs: Record<string, string> = {};
    if (!consentTerms) errs.consentTerms = 'You must agree to the Terms of Service';
    if (!consentPrivacy) errs.consentPrivacy = 'You must agree to the Privacy Policy';
    if (!consentVerification) errs.consentVerification = 'You must consent to credential verification';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    const consentTimestamp = new Date().toISOString();
    const consents = {
      terms_of_service:        { accepted_at: consentTimestamp, version: '1.0' },
      privacy_policy:          { accepted_at: consentTimestamp, version: '1.0' },
      credential_verification: { accepted_at: consentTimestamp, version: '1.0' },
    };

    try {
      // 1. Create or resume draft
      let appId = applicationId;
      if (!appId) {
        const app = await apiClient.post<{ id: string }>('/applications', {});
        appId = app.id;
        setApplicationId(appId);
      }

      // 2. Patch all steps sequentially
      await apiClient.patch(`/applications/${appId}/step-1`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        profilePhotoUrl: formData.profilePhotoUrl || undefined,
        designation: formData.designation || undefined,
        headline: formData.headline || undefined,
        bio: formData.bio || undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
        region: formData.region || undefined,
        country: formData.country || undefined,
        state: formData.state || undefined,
        city: formData.city || undefined,
        phoneExtension: formData.phoneExtension || undefined,
        phone: formData.phone || undefined,
        contactEmail: formData.contactEmail || undefined,
      });

      await apiClient.patch(`/applications/${appId}/step-2`, {
        yearsOfExperience: formData.yearsOfExperience !== '' ? formData.yearsOfExperience : undefined,
        firmName: formData.firmName || undefined,
        firmSize: formData.firmSize || undefined,
        firmWebsiteUrl: formData.firmWebsiteUrl || undefined,
        consultationFeeMinUsd: formData.consultationFeeMinUsd !== '' ? formData.consultationFeeMinUsd : undefined,
        consultationFeeMaxUsd: formData.consultationFeeMaxUsd !== '' ? formData.consultationFeeMaxUsd : undefined,
        credentials: formData.credentials,
        workExperience: formData.workExperience,
        education: formData.education,
      });

      await apiClient.patch(`/applications/${appId}/step-3`, {
        primaryServiceId: formData.primaryServiceId,
        secondaryServiceIds: formData.secondaryServiceIds,
        keyEngagements: formData.keyEngagements,
        engagements: formData.engagements,
        availability: formData.availability,
      });

      // 3. Submit with consents
      await apiClient.post(`/applications/${appId}/submit`, { consents });

      // 4. Redirect
      router.push('/application/status');
    } catch (err) {
      if (err instanceof ApiError) {
        const alreadySubmitted = [
          'APPLICATION_UNDER_REVIEW',
          'APPLICATION_APPROVED',
          'APPLICATION_WAITLISTED',
        ].includes(err.code);
        if (alreadySubmitted) {
          router.push('/application/status');
          return;
        }
      }
      const message = err instanceof Error ? err.message : 'Unknown error';
      setToast(`Submission failed: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border bg-red-50 border-red-200 text-red-800">
          {toast}
        </div>
      )}

      {/* ── Header — only shown before submission ────────────── */}
      {!applicationId && (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Review your application</h2>
            <p className="text-sm text-brand-text-muted mt-1">
              Everything looks complete. Review the highlights below and submit when you&apos;re ready.
              Use the Back button to make any changes.
            </p>
          </div>
        </div>
      </div>
      )}

      {/* ── Profile ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-muted mb-4">Profile</h3>
        <div className="flex items-start gap-4">
          {(formData.profilePhotoBase64 || formData.profilePhotoUrl) ? (
            <img
              src={formData.profilePhotoBase64 || formData.profilePhotoUrl}
              alt=""
              className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-brand-surface border border-gray-100 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-brand-text-muted">
                {formData.firstName?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-brand-navy text-base">
              {formData.firstName} {formData.lastName}
            </p>
            {formData.designation && (
              <p className="text-sm text-brand-blue font-semibold mt-0.5">{formData.designation}</p>
            )}
            {formData.headline && (
              <p className="text-sm text-brand-text-secondary mt-1 leading-snug">{formData.headline}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              {(formData.city || formData.country) && (
                <span className="text-xs text-brand-text-muted">
                  {[formData.city, formData.country].filter(Boolean).join(', ')}
                </span>
              )}
              {formData.yearsOfExperience !== '' && (
                <span className="text-xs text-brand-text-muted">{formData.yearsOfExperience} yrs experience</span>
              )}
            </div>
            {topCredentials.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {topCredentials.map((abbr) => (
                  <span key={abbr} className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-blue-subtle border border-blue-100 text-xs font-bold text-brand-blue">
                    {abbr}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {(formData.firmName || formData.firmWebsiteUrl) && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
            <div className="min-w-0">
              {formData.firmName && (
                <p className="text-xs font-semibold text-brand-text-secondary">{formData.firmName}{formData.firmSize ? ` · ${formData.firmSize}` : ''}</p>
              )}
              {formData.firmWebsiteUrl && (
                <a href={formData.firmWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-blue hover:underline truncate block mt-0.5">
                  {formData.firmWebsiteUrl}
                </a>
              )}
            </div>
          </div>
        )}
        {formData.bio && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-brand-text-secondary mb-1.5">Professional Bio</p>
            <p className="text-sm text-brand-text-secondary leading-relaxed whitespace-pre-wrap">{formData.bio}</p>
          </div>
        )}
      </div>

      {/* ── Experience & Qualifications ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-muted mb-5">Experience &amp; Qualifications</h3>

        {/* Work experience */}
        {formData.workExperience.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-brand-text-secondary mb-3">Work Experience</p>
            <div className="space-y-3">
              {formData.workExperience.map((exp) => (
                <div key={exp.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-surface border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-navy leading-snug">
                      {exp.title || '—'}
                      {exp.isCurrent && (
                        <span className="ml-2 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full align-middle">Current</span>
                      )}
                    </p>
                    <p className="text-xs text-brand-text-secondary mt-0.5">
                      {[exp.company, exp.city, exp.firmSize ? `${exp.firmSize} people` : null].filter(Boolean).join(' · ')}
                    </p>
                    {(exp.startDate || exp.endDate) && (
                      <p className="text-xs text-brand-text-muted mt-0.5">
                        {fmtDate(exp.startDate) || '—'} → {exp.isCurrent ? 'Present' : (fmtDate(exp.endDate) || '—')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {formData.education.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-brand-text-secondary mb-3">Education</p>
            <div className="space-y-3">
              {formData.education.map((edu) => (
                <div key={edu.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-surface border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-navy leading-snug">{edu.institution || '—'}</p>
                    <p className="text-xs text-brand-text-secondary mt-0.5">
                      {[edu.degree, edu.field].filter(Boolean).join(', ')}
                    </p>
                    {(edu.startYear || edu.endYear) && (
                      <p className="text-xs text-brand-text-muted mt-0.5">
                        {edu.startYear || '—'} – {edu.endYear || '—'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credentials */}
        {formData.credentials.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-brand-text-secondary mb-3">Credentials &amp; Qualifications</p>
            <div className="space-y-2.5">
              {formData.credentials.map((cred) => (
                <div key={cred.id} className="flex items-start gap-3 p-3 rounded-xl bg-brand-surface border border-gray-100">
                  {cred.abbreviation && (
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-brand-blue-subtle border border-blue-100 text-xs font-bold text-brand-blue shrink-0">
                      {cred.abbreviation}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-navy leading-snug">{cred.qualificationName || '—'}</p>
                    <p className="text-xs text-brand-text-muted mt-0.5">
                      {[cred.issuingBody, cred.year ? String(cred.year) : null].filter(Boolean).join(' · ')}
                    </p>
                    {cred.documentUrl && (
                      <p className="text-xs text-green-600 mt-0.5 font-medium">✓ Document uploaded</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Service & Key Engagements ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-muted mb-4">Service &amp; Expertise</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-brand-text-secondary mb-1">Primary service</p>
            <p className="text-sm font-bold text-brand-navy">
              {primaryService?.name ?? '—'}
            </p>
            {primaryCategory && (
              <p className="text-xs text-brand-text-muted mt-0.5">{primaryCategory.name}</p>
            )}
          </div>
          {secondaryServices.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-brand-text-secondary mb-1">Additional services</p>
              <p className="text-sm text-brand-text-secondary">{secondaryServices.join(' · ')}</p>
            </div>
          )}
          {formData.keyEngagements.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-brand-text-secondary mb-2">Why you for this area</p>
              <ol className="space-y-1.5">
                {formData.keyEngagements.map((ke, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-brand-text-secondary">
                    <span className="w-4 h-4 rounded-full bg-brand-navy text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {ke}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* ── Availability & Rates ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-muted mb-4">Availability &amp; Rates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-semibold text-brand-text-secondary mb-2">Available days</p>
            <div className="flex flex-wrap gap-1.5">
              {formData.availability.days.length > 0 ? (
                formData.availability.days.map((day) => (
                  <span key={day} className="px-2.5 py-1 rounded-lg bg-brand-blue text-white text-xs font-semibold">
                    {day.slice(0, 3)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-brand-text-muted">Not set</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-text-secondary mb-1">Timezone</p>
            <p className="text-sm text-brand-text-secondary">
              {formData.availability.timezone?.replace(/_/g, ' ') || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-text-secondary mb-1">Consultation fee</p>
            <p className="text-sm text-brand-text-secondary">
              {formData.consultationFeeMinUsd !== '' ? (
                <>
                  USD {formData.consultationFeeMinUsd.toLocaleString()}
                  {formData.consultationFeeMaxUsd != null && formData.consultationFeeMaxUsd !== '' && ` – ${(formData.consultationFeeMaxUsd as number).toLocaleString()}`}
                </>
              ) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-text-secondary mb-1">Available hours</p>
            <p className="text-sm text-brand-text-secondary">
              {formData.availability.startHour}:00 – {formData.availability.endHour}:00
            </p>
          </div>
        </div>
      </div>


      {/* ── Declaration & Consent — hidden once submitted ────── */}
      {!applicationId && (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h2 className="text-base font-bold text-brand-navy mb-1">Declaration &amp; Consent</h2>
        <p className="text-xs text-brand-text-muted mb-5">All three consents are required to submit your application.</p>
        <div className="space-y-3">

          {/* Terms of Service */}
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
              {' '}<span className="text-brand-text-muted text-xs">(v1.0)</span>
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
          {errors.consentTerms && <p className="text-xs text-red-500 pl-3">{errors.consentTerms}</p>}

          {/* Privacy Policy */}
          <label className={`flex items-start gap-3 cursor-pointer rounded-xl p-3 border transition-colors ${consentPrivacy ? 'bg-green-50 border-green-200' : errors.consentPrivacy ? 'bg-red-50 border-red-200' : 'border-gray-100 hover:bg-brand-surface'}`}>
            <input
              type="checkbox"
              checked={consentPrivacy}
              onChange={(e) => { setConsentPrivacy(e.target.checked); setErrors((err) => ({ ...err, consentPrivacy: '' })); }}
              className="mt-0.5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="text-sm text-brand-text-secondary leading-relaxed">
              I agree to the{' '}
              <a href="/privacy" target="_blank" className="text-brand-blue hover:underline font-medium">Privacy Policy</a>
              {' '}<span className="text-brand-text-muted text-xs">(v1.0)</span>
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
          {errors.consentPrivacy && <p className="text-xs text-red-500 pl-3">{errors.consentPrivacy}</p>}

          {/* Credential verification */}
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
      )}

      {/* Error summary */}
      {Object.values(errors).some(Boolean) && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>You must agree to all three consents before submitting your application.</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {!applicationId ? (
          <button type="button" onClick={onBack} className="btn-outline px-6 py-3">
            <svg className="mr-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        ) : (
          <div />
        )}
        {!applicationId && (
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
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
        )}
      </div>
    </div>
  );
}
