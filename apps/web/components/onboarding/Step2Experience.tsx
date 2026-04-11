'use client';

import { useState, useEffect, useRef } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { WorkExperienceEntry, EducationEntry } from '@/stores/onboardingStore';

// ── Date / Year helpers ───────────────────────────────────────────────────────

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CURR_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURR_YEAR - 1959 }, (_, i) => CURR_YEAR - i);

function MonthYearPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const parts = value ? value.split('-') : ['', ''];
  const [selYear, setSelYear] = useState(parts[0] ?? '');
  const [selMonth, setSelMonth] = useState(parts[1] ?? '');

  // Sync with external resets (e.g. isCurrent toggled) without overwriting
  // partial user selections that haven't been committed to parent yet.
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      const p = value ? value.split('-') : ['', ''];
      setSelYear(p[0] ?? '');
      setSelMonth(p[1] ?? '');
    }
  }, [value]);

  function handleMonthChange(m: string) {
    setSelMonth(m);
    if (selYear && m) onChange(`${selYear}-${m}`);
    else if (!m && !selYear) onChange('');
  }

  function handleYearChange(y: string) {
    setSelYear(y);
    if (y && selMonth) onChange(`${y}-${selMonth}`);
    else if (!y && !selMonth) onChange('');
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        value={selMonth}
        disabled={disabled}
        onChange={(e) => handleMonthChange(e.target.value)}
        className="input-base text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Month</option>
        {MONTHS_SHORT.map((m, i) => (
          <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
        ))}
      </select>
      <select
        value={selYear}
        disabled={disabled}
        onChange={(e) => handleYearChange(e.target.value)}
        className="input-base text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Year</option>
        {YEAR_OPTIONS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
      </select>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
  onNext: () => void;
}

const FIRM_SIZES = ['Solo', '2–10', '11–50', '51–200', '200+'] as const;
type ToastState = { message: string; type: 'success' | 'error' } | null;

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Step2Experience({ onBack, onNext }: Props) {
  const { formData, setStep2 } = useOnboardingStore();
  const [toast, setToast] = useState<ToastState>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Local state
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>(formData.yearsOfExperience);
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

  // Sync from store when LinkedIn prefill populates data, and auto-calculate years
  useEffect(() => {
    if (formData.workExperience.length > 0 && workExperience.length === 0) {
      setWorkExperience(formData.workExperience);

      // Auto-calculate overall years of experience only if not already set
      if (yearsOfExperience === '') {
        const exps = formData.workExperience;
        // Earliest start date across all entries
        const sorted = exps
          .filter((e) => e.startDate)
          .sort((a, b) => a.startDate.localeCompare(b.startDate));
        const earliest = sorted[0];
        // End date: use current job's end (today), or the latest end date
        const currentJob = exps.find((e) => e.isCurrent);
        const endDate = currentJob ? new Date() : (() => {
          const latest = [...exps]
            .filter((e) => e.endDate)
            .sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
          return latest?.endDate ? new Date(latest.endDate + '-01') : new Date();
        })();
        if (earliest?.startDate) {
          const start = new Date(earliest.startDate + '-01');
          const months =
            (endDate.getFullYear() - start.getFullYear()) * 12 +
            (endDate.getMonth() - start.getMonth());
          const years = Math.round(months / 12);
          if (years > 0) setYearsOfExperience(years);
        }
      }
    }
    if (formData.education.length > 0 && education.length === 0) {
      setEducation(formData.education);
    }
    if (formData.yearsOfExperience !== '' && yearsOfExperience === '') {
      setYearsOfExperience(formData.yearsOfExperience);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.workExperience, formData.education, formData.yearsOfExperience]);

  // ── Work experience ────────────────────────────────────────────────────────

  function addWorkExp() {
    if (workExperience.length >= 5) return;
    setWorkExperience((wx) => [
      ...wx,
      { id: genId(), title: '', company: '', website: '', city: '', firmSize: '', startDate: '', endDate: '', isCurrent: false },
    ]);
  }
  function updateWorkExp(id: string, key: keyof WorkExperienceEntry, value: string | boolean) {
    setWorkExperience((wx) => wx.map((e) => (e.id === id ? { ...e, [key]: value } : e)));
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

  // ── Validation + Next ──────────────────────────────────────────────────────

  function handleNext() {
    // Derive firm details from the current (or first) work experience entry
    const primaryExp = workExperience.find((e) => e.isCurrent) ?? workExperience[0];

    setStep2({
      yearsOfExperience,
      firmName: primaryExp?.company ?? '',
      firmSize: primaryExp?.firmSize ?? '',
      firmWebsiteUrl: primaryExp?.website ?? '',
      qualifications: [],
      credentials: [],
      workExperience,
      education,
    });

    const errs: Record<string, string> = {};
    if (!yearsOfExperience && yearsOfExperience !== 0) errs.years = 'Overall years of experience is required';
    if (workExperience.length === 0) errs.workExperience = 'At least one work experience entry is required';
    if (education.length === 0) errs.education = 'At least one education entry is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onNext();
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.message}
        </div>
      )}

      {/* ── Professional Background ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-brand-navy mb-6">Professional Background</h2>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
            Overall years of experience <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            max={60}
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 12"
            className={`input-base w-full sm:w-48 ${errors.years ? 'border-red-300' : ''}`}
          />
          {errors.years && <p className="mt-1 text-xs text-red-500">{errors.years}</p>}
        </div>

        {/* Work Experience sub-section */}
        <div className="border-t border-gray-100 pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">Work Experience <span className="text-red-500">*</span></h3>
              <p className="text-xs text-brand-text-muted mt-0.5">At least 1 entry required · up to 5</p>
            </div>
            {workExperience.length < 5 && (
              <button type="button" onClick={addWorkExp} className="btn-outline text-sm px-4 py-2">+ Add entry</button>
            )}
          </div>
          {errors.workExperience && <p className="mb-3 text-xs text-red-500">{errors.workExperience}</p>}
          {workExperience.length === 0 ? (
            <p className="text-sm text-brand-text-muted text-center py-4">No work experience added yet. Click <span className="font-semibold">+ Add entry</span> to begin.</p>
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
                      <label className="block text-xs text-brand-text-muted mb-1">Company website <span className="text-brand-text-muted font-normal">(optional)</span></label>
                      <input type="url" value={exp.website ?? ''} onChange={(e) => updateWorkExp(exp.id, 'website', e.target.value)} placeholder="https://example.com" className="input-base w-full text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">City</label>
                      <input type="text" value={exp.city ?? ''} onChange={(e) => updateWorkExp(exp.id, 'city', e.target.value)} placeholder="e.g. London" className="input-base w-full text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">Firm size <span className="text-brand-text-muted font-normal">(optional)</span></label>
                      <select value={exp.firmSize ?? ''} onChange={(e) => updateWorkExp(exp.id, 'firmSize', e.target.value)} className="input-base w-full text-sm">
                        <option value="">Select size</option>
                        {FIRM_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">Start date</label>
                      <MonthYearPicker value={exp.startDate} onChange={(v) => updateWorkExp(exp.id, 'startDate', v)} />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">
                        {exp.isCurrent ? 'End date (present)' : 'End date'}
                      </label>
                      <MonthYearPicker value={exp.endDate} onChange={(v) => updateWorkExp(exp.id, 'endDate', v)} disabled={exp.isCurrent} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input type="checkbox" checked={exp.isCurrent} onChange={(e) => updateWorkExp(exp.id, 'isCurrent', e.target.checked)} className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
                    <span className="text-xs text-brand-text-secondary">I currently work here</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Education & Qualification ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Education &amp; Qualification <span className="text-red-500">*</span></h2>
            <p className="text-xs text-brand-text-muted mt-0.5">At least 1 entry required · up to 3</p>
          </div>
          {education.length < 3 && (
            <button type="button" onClick={addEdu} className="btn-outline text-sm px-4 py-2">+ Add entry</button>
          )}
        </div>
        {errors.education && <p className="mb-3 text-xs text-red-500">{errors.education}</p>}
        {education.length === 0 ? (
          <p className="text-sm text-brand-text-muted text-center py-4">No education added yet. Click <span className="font-semibold">+ Add entry</span> to begin.</p>
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

      {/* Error summary */}
      {Object.values(errors).some(Boolean) && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>Some required fields are incomplete — scroll up to fix them before continuing.</span>
        </div>
      )}

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
