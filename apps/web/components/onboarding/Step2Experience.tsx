'use client';

import { useState, useEffect, useRef } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { WorkExperienceEntry, EducationEntry, CredentialEntry } from '@/stores/onboardingStore';
import { apiClient } from '@/lib/apiClient';

// ── Qualification taxonomy (hardcoded) ────────────────────────────────────────
// TODO: Replace with a qualification_types table + GET /taxonomy/qualifications
// endpoint so the ops team can manage this list without code deploys.
const QUALIFICATION_TYPES: {
  id: string;
  name: string;
  abbreviation: string;
  issuingBody: string;
  domain: 'finance' | 'law' | 'compliance' | 'other';
}[] = [
  // ── Finance ──────────────────────────────────────────────────────────────────
  { id: 'ca-icai',   name: 'Chartered Accountant',                       abbreviation: 'CA',    issuingBody: 'Institute of Chartered Accountants of India (ICAI)',          domain: 'finance' },
  { id: 'ca-icaew',  name: 'Chartered Accountant (ACA / FCA)',           abbreviation: 'ACA',   issuingBody: 'ICAEW (England & Wales)',                                     domain: 'finance' },
  { id: 'ca-caanz',  name: 'Chartered Accountant (Australia / NZ)',      abbreviation: 'CA',    issuingBody: 'Chartered Accountants Australia & New Zealand (CAANZ)',        domain: 'finance' },
  { id: 'ca-icap',   name: 'Chartered Accountant (Pakistan)',            abbreviation: 'CA',    issuingBody: 'Institute of Chartered Accountants of Pakistan (ICAP)',        domain: 'finance' },
  { id: 'ca-casl',   name: 'Chartered Accountant (Sri Lanka)',           abbreviation: 'CA',    issuingBody: 'CA Sri Lanka',                                               domain: 'finance' },
  { id: 'cfa',       name: 'Chartered Financial Analyst',                abbreviation: 'CFA',   issuingBody: 'CFA Institute',                                              domain: 'finance' },
  { id: 'cpa-us',    name: 'Certified Public Accountant (US)',           abbreviation: 'CPA',   issuingBody: 'AICPA / State Board of Accountancy',                         domain: 'finance' },
  { id: 'cpa-ca',    name: 'Chartered Professional Accountant (Canada)', abbreviation: 'CPA',   issuingBody: 'CPA Canada',                                                 domain: 'finance' },
  { id: 'cpa-au',    name: 'Certified Practising Accountant (Australia)',abbreviation: 'CPA',   issuingBody: 'CPA Australia',                                              domain: 'finance' },
  { id: 'acca',      name: 'ACCA',                                       abbreviation: 'ACCA',  issuingBody: 'Association of Chartered Certified Accountants (ACCA)',       domain: 'finance' },
  { id: 'cima',      name: 'Chartered Institute of Management Accountants', abbreviation: 'CIMA', issuingBody: 'CIMA',                                                    domain: 'finance' },
  { id: 'frm',       name: 'Financial Risk Manager',                     abbreviation: 'FRM',   issuingBody: 'Global Association of Risk Professionals (GARP)',             domain: 'finance' },
  { id: 'caia',      name: 'Chartered Alternative Investment Analyst',   abbreviation: 'CAIA',  issuingBody: 'CAIA Association',                                           domain: 'finance' },
  { id: 'cfp',       name: 'Certified Financial Planner',                abbreviation: 'CFP',   issuingBody: 'CFP Board',                                                  domain: 'finance' },
  { id: 'cma',       name: 'Certified Management Accountant',            abbreviation: 'CMA',   issuingBody: 'Institute of Management Accountants (IMA)',                  domain: 'finance' },
  { id: 'cs-icsi',   name: 'Company Secretary',                          abbreviation: 'CS',    issuingBody: 'Institute of Company Secretaries of India (ICSI)',            domain: 'finance' },
  { id: 'imc',       name: 'Investment Management Certificate',          abbreviation: 'IMC',   issuingBody: 'CFA Society UK',                                             domain: 'finance' },
  { id: 'cmt',       name: 'Chartered Market Technician',                abbreviation: 'CMT',   issuingBody: 'CMT Association',                                            domain: 'finance' },
  { id: 'ciia',      name: 'Certified International Investment Analyst', abbreviation: 'CIIA',  issuingBody: 'ACIIA',                                                      domain: 'finance' },
  { id: 'fmva',      name: 'Financial Modelling & Valuation Analyst',    abbreviation: 'FMVA',  issuingBody: 'Corporate Finance Institute (CFI)',                          domain: 'finance' },
  { id: 'cip',       name: 'Chartered Insurance Professional',           abbreviation: 'CIP',   issuingBody: 'Insurance Institute of Canada',                              domain: 'finance' },
  { id: 'acii',      name: 'Associate of the Chartered Insurance Institute', abbreviation: 'ACII', issuingBody: 'Chartered Insurance Institute (CII)',                    domain: 'finance' },
  { id: 'cb',        name: 'Chartered Banker',                           abbreviation: 'CB',    issuingBody: 'Chartered Banker Institute',                                 domain: 'finance' },
  // ── Law ──────────────────────────────────────────────────────────────────────
  { id: 'sol-ew',    name: 'Solicitor (England & Wales)',                abbreviation: 'Solicitor', issuingBody: 'Solicitors Regulation Authority (SRA)',              domain: 'law' },
  { id: 'bar-ew',    name: 'Barrister (England & Wales)',                abbreviation: 'Barrister', issuingBody: 'Bar Standards Board (BSB)',                          domain: 'law' },
  { id: 'adv-in',    name: 'Advocate (India)',                           abbreviation: 'Advocate',  issuingBody: 'Bar Council of India',                              domain: 'law' },
  { id: 'jd-us',     name: 'Juris Doctor / Attorney at Law (US)',        abbreviation: 'JD',        issuingBody: 'State Bar / American Bar Association',              domain: 'law' },
  { id: 'sol-ie',    name: 'Solicitor (Ireland)',                        abbreviation: 'Solicitor', issuingBody: 'Law Society of Ireland',                            domain: 'law' },
  { id: 'bar-ie',    name: 'Barrister (Ireland)',                        abbreviation: 'Barrister', issuingBody: 'Bar Council of Ireland',                            domain: 'law' },
  { id: 'sol-au',    name: 'Solicitor (Australia)',                      abbreviation: 'Solicitor', issuingBody: 'Law Society of Australia (state-based)',            domain: 'law' },
  { id: 'bar-au',    name: 'Barrister (Australia)',                      abbreviation: 'Barrister', issuingBody: 'Bar Association (state-based)',                     domain: 'law' },
  { id: 'adv-sg',    name: 'Advocate & Solicitor (Singapore)',           abbreviation: 'Advocate',  issuingBody: 'Law Society of Singapore',                         domain: 'law' },
  { id: 'adv-ae',    name: 'Advocate (UAE)',                             abbreviation: 'Advocate',  issuingBody: 'UAE Ministry of Justice',                          domain: 'law' },
  { id: 'cilex',     name: 'Chartered Legal Executive',                  abbreviation: 'CILEx',     issuingBody: 'Chartered Institute of Legal Executives (CILEx)',  domain: 'law' },
  { id: 'notary',    name: 'Notary Public',                              abbreviation: 'Notary',    issuingBody: 'Various jurisdictions',                            domain: 'law' },
  { id: 'llm',       name: 'Master of Laws',                             abbreviation: 'LLM',       issuingBody: 'Various universities',                             domain: 'law' },
  // ── Compliance & Risk ─────────────────────────────────────────────────────────
  { id: 'cams',      name: 'Certified Anti-Money Laundering Specialist', abbreviation: 'CAMS',  issuingBody: 'ACAMS',                                                      domain: 'compliance' },
  { id: 'cfe',       name: 'Certified Fraud Examiner',                   abbreviation: 'CFE',   issuingBody: 'Association of Certified Fraud Examiners (ACFE)',            domain: 'compliance' },
  { id: 'cia',       name: 'Certified Internal Auditor',                 abbreviation: 'CIA',   issuingBody: 'Institute of Internal Auditors (IIA)',                       domain: 'compliance' },
  { id: 'cisa',      name: 'Certified Information Systems Auditor',      abbreviation: 'CISA',  issuingBody: 'ISACA',                                                      domain: 'compliance' },
  { id: 'ccp',       name: 'Certified Compliance Professional',          abbreviation: 'CCP',   issuingBody: 'Society of Corporate Compliance & Ethics (SCCE)',            domain: 'compliance' },
  // ── Other ─────────────────────────────────────────────────────────────────────
  { id: 'other',     name: 'Other (specify)',                            abbreviation: '',      issuingBody: '',                                                           domain: 'other' },
];

const DOMAIN_LABELS: Record<string, string> = {
  finance: 'Finance & Accounting',
  law: 'Law',
  compliance: 'Compliance & Risk',
  other: 'Other',
};

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
  const [credentials, setCredentials] = useState<CredentialEntry[]>(formData.credentials);
  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(
    formData.workExperience.length > 0 ? formData.workExperience : [],
  );
  const [education, setEducation] = useState<EducationEntry[]>(
    formData.education.length > 0 ? formData.education : [],
  );

  // Per-credential qualification search state
  const [credTypeSearch, setCredTypeSearch] = useState<Record<string, string>>({});
  const [credTypeOpen, setCredTypeOpen] = useState<Record<string, boolean>>({});
  // Per-credential file input refs
  const credFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Credential handlers ────────────────────────────────────────────────────

  function addCredential() {
    if (credentials.length >= 10) return;
    setCredentials((c) => [
      ...c,
      { id: genId(), qualificationTypeId: '', qualificationName: '', abbreviation: '', issuingBody: '', year: '', documentUrl: '' },
    ]);
  }

  function selectQualificationType(credId: string, typeId: string) {
    const type = QUALIFICATION_TYPES.find((t) => t.id === typeId);
    setCredentials((c) =>
      c.map((cr) =>
        cr.id === credId
          ? {
              ...cr,
              qualificationTypeId: typeId,
              qualificationName: type?.name ?? '',
              abbreviation: type?.abbreviation ?? '',
              issuingBody: type?.issuingBody ?? '',
            }
          : cr,
      ),
    );
    setCredTypeOpen((o) => ({ ...o, [credId]: false }));
    setCredTypeSearch((s) => ({ ...s, [credId]: '' }));
  }

  function updateCredential(id: string, key: keyof CredentialEntry, value: string | number | '') {
    setCredentials((c) => c.map((cr) => (cr.id === id ? { ...cr, [key]: value } : cr)));
  }

  function removeCredential(id: string) {
    setCredentials((c) => c.filter((cr) => cr.id !== id));
  }

  async function handleCredentialUpload(credId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCredentials((c) => c.map((cr) => (cr.id === credId ? { ...cr, uploading: true } : cr)));
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await apiClient.upload<{ url: string }>('/upload/document', fd, { type: 'credentials' });
      setCredentials((c) => c.map((cr) => (cr.id === credId ? { ...cr, documentUrl: result.url, uploading: false } : cr)));
    } catch {
      setCredentials((c) => c.map((cr) => (cr.id === credId ? { ...cr, uploading: false } : cr)));
      setToast({ message: 'Document upload failed. Please try again.', type: 'error' });
    }
  }

  function filteredTypes(credId: string) {
    const q = (credTypeSearch[credId] ?? '').toLowerCase();
    if (!q) return QUALIFICATION_TYPES;
    return QUALIFICATION_TYPES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.abbreviation.toLowerCase().includes(q) ||
        t.issuingBody.toLowerCase().includes(q),
    );
  }

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
    // Derive qualifications badges from credentials (backward compat with DB column)
    const derivedQualifications = [
      ...new Set(credentials.filter((c) => c.abbreviation && !c.uploading).map((c) => c.abbreviation)),
    ];

    // Derive firm details from the current (or first) work experience entry
    const primaryExp = workExperience.find((e) => e.isCurrent) ?? workExperience[0];

    setStep2({
      yearsOfExperience,
      firmName: primaryExp?.company ?? '',
      firmSize: primaryExp?.firmSize ?? '',
      firmWebsiteUrl: primaryExp?.website ?? '',
      qualifications: derivedQualifications,
      credentials,
      workExperience,
      education,
    });

    const errs: Record<string, string> = {};
    if (!yearsOfExperience && yearsOfExperience !== 0) errs.years = 'Years of experience is required';
    if (credentials.length === 0) errs.credentials = 'At least one professional qualification is required';
    if (workExperience.length === 0) errs.workExperience = 'At least one work experience entry is required';
    if (education.length === 0) errs.education = 'At least one education entry is required';

    credentials.forEach((cred) => {
      // "Other" must have a custom name
      if (cred.qualificationTypeId === 'other') {
        const name = cred.qualificationName.trim();
        if (!name || name === 'Other (specify)') {
          errs[`cred_name_${cred.id}`] = 'Please enter the qualification name';
        }
      }
      // Document is required for every credential
      if (!cred.documentUrl && !cred.uploading) {
        errs[`cred_doc_${cred.id}`] = 'Please attach a certificate or supporting document';
      }
    });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onNext();
  }

  // ── Render grouped qualification options ──────────────────────────────────

  function renderQualificationOptions(credId: string) {
    const types = filteredTypes(credId);
    const groups = ['finance', 'law', 'compliance', 'other'] as const;
    return groups.map((domain) => {
      const items = types.filter((t) => t.domain === domain);
      if (items.length === 0) return null;
      return (
        <div key={domain}>
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-muted bg-brand-surface border-b border-gray-100">
            {DOMAIN_LABELS[domain]}
          </div>
          {items.map((t) => (
            <button
              key={t.id}
              type="button"
              onMouseDown={() => selectQualificationType(credId, t.id)}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-brand-surface transition-colors"
            >
              <span className="font-medium text-brand-navy">{t.name}</span>
              {t.abbreviation && (
                <span className="ml-2 text-xs text-brand-blue font-semibold bg-brand-blue-subtle px-1.5 py-0.5 rounded-full">
                  {t.abbreviation}
                </span>
              )}
              {t.id !== 'other' && (
                <p className="text-xs text-brand-text-muted mt-0.5 truncate">{t.issuingBody}</p>
              )}
            </button>
          ))}
        </div>
      );
    });
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
            Years of experience <span className="text-red-500">*</span>
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

      {/* ── Credentials ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Qualifications &amp; Credentials <span className="text-red-500">*</span></h2>
            <p className="text-xs text-brand-text-muted mt-0.5">
              At least 1 required · licences, certifications, and professional memberships.
            </p>
          </div>
          {credentials.length < 10 && (
            <button type="button" onClick={addCredential} className="btn-outline text-sm px-4 py-2">
              + Add credential
            </button>
          )}
        </div>

        {errors.credentials && <p className="mb-3 text-xs text-red-500">{errors.credentials}</p>}
        {credentials.length === 0 ? (
          <p className="text-sm text-brand-text-muted text-center py-4">No credentials added yet. Click <span className="font-semibold">+ Add credential</span> to begin.</p>
        ) : (
          <div className="space-y-4">
            {credentials.map((cred, idx) => (
              <div key={cred.id} className="rounded-xl border border-gray-100 bg-brand-surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-brand-text-muted">Credential {idx + 1}</p>
                  <button type="button" onClick={() => removeCredential(cred.id)} className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
                </div>

                {/* Row 1: qualification type + year */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  {/* Qualification searchable dropdown */}
                  <div className="sm:col-span-2 relative">
                    <label className="block text-xs text-brand-text-muted mb-1">Qualification <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={credTypeOpen[cred.id] ? (credTypeSearch[cred.id] ?? '') : cred.qualificationName}
                      onFocus={() => {
                        setCredTypeSearch((s) => ({ ...s, [cred.id]: '' }));
                        setCredTypeOpen((o) => ({ ...o, [cred.id]: true }));
                      }}
                      onBlur={() => setTimeout(() => setCredTypeOpen((o) => ({ ...o, [cred.id]: false })), 150)}
                      onChange={(e) => setCredTypeSearch((s) => ({ ...s, [cred.id]: e.target.value }))}
                      placeholder="Search CA, CFA, Solicitor…"
                      className="input-base w-full text-sm"
                    />
                    {credTypeOpen[cred.id] && (
                      <div className="absolute z-30 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                        {renderQualificationOptions(cred.id)}
                      </div>
                    )}
                  </div>
                  {/* Year */}
                  <div>
                    <label className="block text-xs text-brand-text-muted mb-1">Year obtained</label>
                    <select
                      value={cred.year}
                      onChange={(e) => updateCredential(cred.id, 'year', e.target.value === '' ? '' : Number(e.target.value))}
                      className="input-base w-full text-sm"
                    >
                      <option value="">Select year</option>
                      {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {/* "Other" — custom name + abbreviation inputs */}
                {cred.qualificationTypeId === 'other' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-brand-text-muted mb-1">
                        Qualification name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cred.qualificationName === 'Other (specify)' ? '' : cred.qualificationName}
                        onChange={(e) => updateCredential(cred.id, 'qualificationName', e.target.value)}
                        placeholder="e.g. Certified Treasury Professional"
                        className={`input-base w-full text-sm ${errors[`cred_name_${cred.id}`] ? 'border-red-300' : ''}`}
                      />
                      {errors[`cred_name_${cred.id}`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`cred_name_${cred.id}`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">Abbreviation</label>
                      <input
                        type="text"
                        value={cred.abbreviation}
                        onChange={(e) => updateCredential(cred.id, 'abbreviation', e.target.value)}
                        placeholder="e.g. CTP"
                        className="input-base w-full text-sm"
                        maxLength={10}
                      />
                    </div>
                  </div>
                )}

                {/* Row 2: issuing body (editable, pre-filled from type) */}
                <div className="mb-3">
                  <label className="block text-xs text-brand-text-muted mb-1">Issuing body</label>
                  <input
                    type="text"
                    value={cred.issuingBody}
                    onChange={(e) => updateCredential(cred.id, 'issuingBody', e.target.value)}
                    placeholder="e.g. ICAI, CFA Institute, Bar Council of India…"
                    className="input-base w-full text-sm"
                  />
                </div>

                {/* Row 3: abbreviation badge + doc upload */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    {cred.abbreviation && cred.qualificationTypeId !== 'other' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-blue-subtle border border-blue-100 text-xs font-bold text-brand-blue">
                        {cred.abbreviation}
                      </span>
                    )}

                    {/* Document upload */}
                    {cred.uploading ? (
                      <span className="flex items-center gap-1.5 text-xs text-brand-text-muted">
                        <svg className="animate-spin h-3.5 w-3.5 text-brand-blue" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Uploading…
                      </span>
                    ) : cred.documentUrl ? (
                      <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Document uploaded
                        <button
                          type="button"
                          onClick={() => updateCredential(cred.id, 'documentUrl', '')}
                          className="ml-1 text-gray-400 hover:text-red-400"
                          aria-label="Remove document"
                        >×</button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => credFileRefs.current[cred.id]?.click()}
                        className={`text-xs font-medium flex items-center gap-1 transition-colors ${errors[`cred_doc_${cred.id}`] ? 'text-red-500 hover:text-red-700' : 'text-brand-blue hover:text-brand-navy'}`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Attach certificate <span className="text-red-500">*</span>
                      </button>
                    )}
                    <input
                      ref={(el) => { credFileRefs.current[cred.id] = el; }}
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) => void handleCredentialUpload(cred.id, e)}
                    />
                  </div>
                  {errors[`cred_doc_${cred.id}`] && (
                    <p className="text-xs text-red-500">{errors[`cred_doc_${cred.id}`]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Education ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Education <span className="text-red-500">*</span></h2>
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
