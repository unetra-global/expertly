'use client';

import { useState, useEffect, useRef } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { WorkExperienceEntry, EducationEntry, CredentialEntry } from '@/stores/onboardingStore';
import { apiClient } from '@/lib/apiClient';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

const FIRM_SIZES = ['Solo', '2–10', '11–50', '51–200', '200+'] as const;

const COUNTRIES = [
  'Australia', 'Bahrain', 'Canada', 'China', 'Egypt', 'France', 'Germany',
  'Ghana', 'Hong Kong', 'India', 'Indonesia', 'Ireland', 'Israel', 'Japan',
  'Jordan', 'Kenya', 'Kuwait', 'Malaysia', 'Mauritius', 'Morocco', 'Netherlands',
  'New Zealand', 'Nigeria', 'Oman', 'Pakistan', 'Qatar', 'Rwanda', 'Saudi Arabia',
  'Singapore', 'South Africa', 'South Korea', 'Sri Lanka', 'Switzerland',
  'Tanzania', 'Turkey', 'Uganda', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Zimbabwe',
];

type ToastState = { message: string; type: 'success' | 'error' } | null;

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

export function Step2Experience({ onBack, onNext }: Props) {
  const { formData, setStep2 } = useOnboardingStore();
  const credentialInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countrySearch, setCountrySearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [qualInput, setQualInput] = useState('');

  // Local state
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>(formData.yearsOfExperience);
  const [firmName, setFirmName] = useState(formData.firmName);
  const [firmSize, setFirmSize] = useState(formData.firmSize);
  const [country, setCountry] = useState(formData.country);
  const [city, setCity] = useState(formData.city);
  const [feeMin, setFeeMin] = useState<number | ''>(formData.consultationFeeMinUsd);
  const [feeMax, setFeeMax] = useState<number | ''>(formData.consultationFeeMaxUsd);
  const [qualifications, setQualifications] = useState<string[]>(formData.qualifications);
  const [credentials, setCredentials] = useState<CredentialEntry[]>(formData.credentials);
  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(
    formData.workExperience.length > 0 ? formData.workExperience : [],
  );
  const [education, setEducation] = useState<EducationEntry[]>(
    formData.education.length > 0 ? formData.education : [],
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Qualifications tag input ───────────────────────────────────────────────
  function addQual() {
    const trimmed = qualInput.trim();
    if (!trimmed || qualifications.includes(trimmed)) return;
    setQualifications((q) => [...q, trimmed]);
    setQualInput('');
  }
  function removeQual(q: string) {
    setQualifications((qs) => qs.filter((x) => x !== q));
  }

  // ── Work experience ────────────────────────────────────────────────────────
  function addWorkExp() {
    if (workExperience.length >= 5) return;
    setWorkExperience((wx) => [
      ...wx,
      { id: genId(), title: '', company: '', startDate: '', endDate: '', isCurrent: false },
    ]);
  }
  function updateWorkExp(id: string, key: keyof WorkExperienceEntry, value: string | boolean) {
    setWorkExperience((wx) =>
      wx.map((e) => (e.id === id ? { ...e, [key]: value } : e)),
    );
  }
  function removeWorkExp(id: string) {
    setWorkExperience((wx) => wx.filter((e) => e.id !== id));
  }

  // ── Education ──────────────────────────────────────────────────────────────
  function addEdu() {
    if (education.length >= 3) return;
    setEducation((ed) => [
      ...ed,
      { id: genId(), institution: '', degree: '', field: '', startYear: '', endYear: '' },
    ]);
  }
  function updateEdu(id: string, key: keyof EducationEntry, value: string | number | '') {
    setEducation((ed) => ed.map((e) => (e.id === id ? { ...e, [key]: value } : e)));
  }
  function removeEdu(id: string) {
    setEducation((ed) => ed.filter((e) => e.id !== id));
  }

  // ── Credential upload ──────────────────────────────────────────────────────
  async function handleCredentialUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (credentials.length >= 5) {
      setToast({ message: 'Maximum 5 credential documents allowed.', type: 'error' });
      return;
    }
    const newCred: CredentialEntry = {
      id: genId(),
      name: '',
      institution: '',
      year: '',
      documentUrl: '',
      uploading: true,
    };
    setCredentials((c) => [...c, newCred]);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await apiClient.upload<{ url: string }>('/upload/document', fd, { type: 'credentials' });
      setCredentials((c) =>
        c.map((cr) => cr.id === newCred.id ? { ...cr, documentUrl: result.url, uploading: false } : cr),
      );
    } catch {
      setCredentials((c) => c.filter((cr) => cr.id !== newCred.id));
      setToast({ message: 'Document upload failed. Please try again.', type: 'error' });
    }
  }
  function updateCredential(id: string, key: keyof CredentialEntry, value: string | number | '') {
    setCredentials((c) => c.map((cr) => cr.id === id ? { ...cr, [key]: value } : cr));
  }
  function removeCredential(id: string) {
    setCredentials((c) => c.filter((cr) => cr.id !== id));
  }

  // ── Validation + Next ──────────────────────────────────────────────────────
  function handleNext() {
    // Persist to store
    setStep2({
      yearsOfExperience,
      firmName,
      firmSize,
      country,
      city,
      consultationFeeMinUsd: feeMin,
      consultationFeeMaxUsd: feeMax,
      qualifications,
      credentials,
      workExperience,
      education,
    });

    const errs: Record<string, string> = {};
    if (!yearsOfExperience && yearsOfExperience !== 0) errs.years = 'Years of experience is required';
    if (!country) errs.country = 'Country is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onNext();
  }

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.message}
        </div>
      )}

      {/* ── Basic info ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-brand-navy mb-6">Professional Background</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Years of experience */}
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
              Years of experience <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 12"
              className={`input-base w-full ${errors.years ? 'border-red-300' : ''}`}
            />
            {errors.years && <p className="mt-1 text-xs text-red-500">{errors.years}</p>}
          </div>

          {/* Firm size */}
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">Firm size</label>
            <select value={firmSize} onChange={(e) => setFirmSize(e.target.value)} className="input-base w-full">
              <option value="">Select firm size</option>
              {FIRM_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Firm name */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">Firm / Organisation name</label>
          <input
            type="text"
            value={firmName}
            onChange={(e) => setFirmName(e.target.value)}
            placeholder="e.g. Smith & Partners LLP"
            className="input-base w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Country — searchable */}
          <div className="relative">
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={countryOpen ? countrySearch : country}
              onChange={(e) => { setCountrySearch(e.target.value); setCountryOpen(true); }}
              onFocus={() => { setCountrySearch(''); setCountryOpen(true); }}
              onBlur={() => setTimeout(() => setCountryOpen(false), 150)}
              placeholder="Search country…"
              className={`input-base w-full ${errors.country ? 'border-red-300' : ''}`}
            />
            {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
            {countryOpen && filteredCountries.length > 0 && (
              <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-card-hover max-h-48 overflow-y-auto">
                {filteredCountries.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={() => { setCountry(c); setCountryOpen(false); setErrors((e) => ({ ...e, country: '' })); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-surface transition-colors ${country === c ? 'bg-brand-blue-subtle text-brand-blue font-medium' : 'text-brand-text'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. London"
              className="input-base w-full"
            />
          </div>
        </div>

        {/* Fee range */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">Consultation fee — min (USD)</label>
            <input
              type="number"
              min={0}
              value={feeMin}
              onChange={(e) => setFeeMin(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 500"
              className="input-base w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">Consultation fee — max (USD)</label>
            <input
              type="number"
              min={0}
              value={feeMax}
              onChange={(e) => setFeeMax(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 2000"
              className="input-base w-full"
            />
          </div>
        </div>

        {/* Qualifications */}
        <div>
          <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">Qualifications</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={qualInput}
              onChange={(e) => setQualInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addQual(); } }}
              placeholder="e.g. CA, LLB — press Enter to add"
              className="input-base flex-1"
            />
            <button type="button" onClick={addQual} className="btn-outline px-4 py-2 text-sm">Add</button>
          </div>
          {qualifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {qualifications.map((q) => (
                <span key={q} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue-subtle border border-blue-100 text-xs font-semibold text-brand-blue">
                  {q}
                  <button type="button" onClick={() => removeQual(q)} aria-label={`Remove ${q}`} className="text-brand-blue/60 hover:text-brand-blue">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Credentials ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Credentials</h2>
            <p className="text-xs text-brand-text-muted mt-0.5">Upload certificate or degree documents (PDF/image, max 10 MB each)</p>
          </div>
          {credentials.length < 5 && (
            <button
              type="button"
              onClick={() => credentialInputRef.current?.click()}
              className="btn-outline text-sm px-4 py-2"
            >
              + Upload document
            </button>
          )}
          <input
            ref={credentialInputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => void handleCredentialUpload(e)}
          />
        </div>

        {credentials.length === 0 ? (
          <p className="text-sm text-brand-text-muted text-center py-4">No credentials added yet.</p>
        ) : (
          <div className="space-y-4">
            {credentials.map((cred) => (
              <div key={cred.id} className="rounded-xl border border-gray-100 bg-brand-surface p-4">
                {cred.uploading ? (
                  <div className="flex items-center gap-3 text-sm text-brand-text-muted">
                    <svg className="animate-spin h-4 w-4 text-brand-blue" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading document…
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">Credential name</label>
                      <input
                        type="text"
                        value={cred.name}
                        onChange={(e) => updateCredential(cred.id, 'name', e.target.value)}
                        placeholder="e.g. ACA"
                        className="input-base w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">Institution</label>
                      <input
                        type="text"
                        value={cred.institution}
                        onChange={(e) => updateCredential(cred.id, 'institution', e.target.value)}
                        placeholder="e.g. ICAEW"
                        className="input-base w-full text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-brand-text-muted mb-1">Year</label>
                        <input
                          type="number"
                          value={cred.year}
                          onChange={(e) => updateCredential(cred.id, 'year', e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="2018"
                          className="input-base w-full text-sm"
                        />
                      </div>
                      <button type="button" onClick={() => removeCredential(cred.id)} className="mt-5 p-2 text-red-400 hover:text-red-600 transition-colors" aria-label="Remove credential">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Work experience ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Work Experience</h2>
            <p className="text-xs text-brand-text-muted mt-0.5">Up to 5 entries</p>
          </div>
          {workExperience.length < 5 && (
            <button type="button" onClick={addWorkExp} className="btn-outline text-sm px-4 py-2">+ Add entry</button>
          )}
        </div>
        {workExperience.length === 0 ? (
          <p className="text-sm text-brand-text-muted text-center py-4">No work experience added yet.</p>
        ) : (
          <div className="space-y-4">
            {workExperience.map((exp, idx) => (
              <div key={exp.id} className="rounded-xl border border-gray-100 bg-brand-surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-brand-text-muted">Position {idx + 1}</p>
                  <button type="button" onClick={() => removeWorkExp(exp.id)} className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-brand-text-muted mb-1">Job title</label>
                    <input type="text" value={exp.title} onChange={(e) => updateWorkExp(exp.id, 'title', e.target.value)} placeholder="Partner" className="input-base w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-text-muted mb-1">Company</label>
                    <input type="text" value={exp.company} onChange={(e) => updateWorkExp(exp.id, 'company', e.target.value)} placeholder="Firm name" className="input-base w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-text-muted mb-1">Start date</label>
                    <input type="month" value={exp.startDate} onChange={(e) => updateWorkExp(exp.id, 'startDate', e.target.value)} className="input-base w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-text-muted mb-1">
                      {exp.isCurrent ? 'End date (present)' : 'End date'}
                    </label>
                    <input
                      type="month"
                      value={exp.endDate}
                      disabled={exp.isCurrent}
                      onChange={(e) => updateWorkExp(exp.id, 'endDate', e.target.value)}
                      className="input-base w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exp.isCurrent}
                    onChange={(e) => updateWorkExp(exp.id, 'isCurrent', e.target.checked)}
                    className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                  />
                  <span className="text-xs text-brand-text-secondary">I currently work here</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Education ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Education</h2>
            <p className="text-xs text-brand-text-muted mt-0.5">Up to 3 entries</p>
          </div>
          {education.length < 3 && (
            <button type="button" onClick={addEdu} className="btn-outline text-sm px-4 py-2">+ Add entry</button>
          )}
        </div>
        {education.length === 0 ? (
          <p className="text-sm text-brand-text-muted text-center py-4">No education added yet.</p>
        ) : (
          <div className="space-y-4">
            {education.map((edu, idx) => (
              <div key={edu.id} className="rounded-xl border border-gray-100 bg-brand-surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-brand-text-muted">Entry {idx + 1}</p>
                  <button type="button" onClick={() => removeEdu(edu.id)} className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-brand-text-muted mb-1">Institution</label>
                    <input type="text" value={edu.institution} onChange={(e) => updateEdu(edu.id, 'institution', e.target.value)} placeholder="University name" className="input-base w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-text-muted mb-1">Degree</label>
                    <input type="text" value={edu.degree} onChange={(e) => updateEdu(edu.id, 'degree', e.target.value)} placeholder="LLB, MBA…" className="input-base w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-text-muted mb-1">Field of study</label>
                    <input type="text" value={edu.field} onChange={(e) => updateEdu(edu.id, 'field', e.target.value)} placeholder="e.g. Corporate Law" className="input-base w-full text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">Start year</label>
                      <input type="number" value={edu.startYear} onChange={(e) => updateEdu(edu.id, 'startYear', e.target.value === '' ? '' : Number(e.target.value))} placeholder="2010" className="input-base w-full text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">End year</label>
                      <input type="number" value={edu.endYear} onChange={(e) => updateEdu(edu.id, 'endYear', e.target.value === '' ? '' : Number(e.target.value))} placeholder="2014" className="input-base w-full text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="btn-outline px-6 py-3">
          <svg className="mr-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button type="button" onClick={handleNext} className="btn-primary px-8 py-3 text-base">
          Next: Services
          <svg className="ml-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
