'use client';

import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, AlertTriangle, Upload, X, Plus } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import type {
  MemberMe,
  WorkExperience,
  Education,
  Credential,
  Testimonial,
  Engagement,
  Availability,
} from '@/types/api';

// ── Constants ──────────────────────────────────────────────────────────────────

const SENSITIVE_FIELDS = [
  'headline', 'bio', 'designation', 'qualifications',
  'credentials', 'workExperiences', 'educations',
];

const COUNTRIES = [
  'United Arab Emirates', 'United Kingdom', 'United States', 'Australia',
  'Canada', 'Singapore', 'India', 'South Africa', 'Nigeria', 'Kenya',
  'Germany', 'France', 'Netherlands', 'Switzerland', 'Hong Kong',
];

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Singapore',
  'Asia/Tokyo', 'Australia/Sydney', 'Africa/Johannesburg', 'Africa/Lagos',
];

const AVAILABILITY_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const AVAILABILITY_SLOTS = ['Morning', 'Afternoon', 'Evening'];
const CONTACT_METHODS = ['Email', 'Phone', 'Video'];
const RESPONSE_TIMES = ['Within 24 hours', 'Within 48 hours', 'Within 1 week'];

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all
      ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ── Warning Dialog ────────────────────────────────────────────────────────────

function WarningDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-brand-text">Save changes?</h3>
            <p className="text-sm text-brand-text-secondary mt-2">
              Saving changes to this section will temporarily remove your verified badge pending re-review.
              Our team will re-verify your profile within 2 business days.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-brand-text-secondary border border-slate-200 rounded-lg hover:bg-brand-surface-alt transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Save anyway
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section Wrapper ────────────────────────────────────────────────────────────

function Section({
  title, children, onSave, isSaving, isSensitive,
}: {
  title: string;
  children: React.ReactNode;
  onSave: (sensitive: boolean) => Promise<void>;
  isSaving: boolean;
  isSensitive?: boolean;
}) {
  const [showWarning, setShowWarning] = useState(false);

  const handleSaveClick = () => {
    if (isSensitive) {
      setShowWarning(true);
    } else {
      void onSave(false);
    }
  };

  return (
    <>
      {showWarning && (
        <WarningDialog
          onConfirm={() => { setShowWarning(false); void onSave(true); }}
          onCancel={() => setShowWarning(false)}
        />
      )}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-brand-text">{title}</h2>
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="px-4 py-1.5 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props { profile: MemberMe }

export default function ProfileEditor({ profile }: Props) {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const saveSection = async (key: string, data: Partial<MemberMe>, isSensitive: boolean) => {
    setSaving((s) => ({ ...s, [key]: true }));
    try {
      await apiClient.patch('/members/me', data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.members.me() });
      const sensitiveMsg = isSensitive
        ? ' Your verified badge is pending re-review.'
        : '';
      showToast(`${key} saved successfully.${sensitiveMsg}`, 'success');
    } catch {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  };

  // ── Photo Section ────────────────────────────────────────────────────────────

  const [photoUrl, setPhotoUrl] = useState(profile.profilePhotoUrl ?? '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/upload/avatar`,
        { method: 'POST', body: form },
      );
      const json = (await resp.json()) as { data?: { url: string } };
      if (json.data?.url) {
        setPhotoUrl(json.data.url);
        await apiClient.patch('/members/me', { profilePhotoUrl: json.data.url });
        void queryClient.invalidateQueries({ queryKey: queryKeys.members.me() });
        showToast('Profile photo updated.', 'success');
      }
    } catch {
      showToast('Photo upload failed.', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Basic Info Section ───────────────────────────────────────────────────────

  const [firstName, setFirstName] = useState(profile.user?.firstName ?? '');
  const [lastName, setLastName] = useState(profile.user?.lastName ?? '');
  const [designation, setDesignation] = useState(profile.designation ?? '');
  const [headline, setHeadline] = useState(profile.headline ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');

  // ── Contact Section ──────────────────────────────────────────────────────────

  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl ?? '');
  const [feeMin, setFeeMin] = useState(profile.feeRangeMin?.toString() ?? '');
  const [feeMax, setFeeMax] = useState(profile.feeRangeMax?.toString() ?? '');

  // ── Location Section ─────────────────────────────────────────────────────────

  const [country, setCountry] = useState(profile.country ?? '');
  const [city, setCity] = useState(profile.city ?? '');
  const [firmName, setFirmName] = useState(profile.firmName ?? '');
  const [firmSize, setFirmSize] = useState(profile.firmSize ?? '');

  // ── Qualifications Section ───────────────────────────────────────────────────

  const [qualTags, setQualTags] = useState<string[]>(
    (profile.qualifications ?? []).map((q) => q.name),
  );
  const [qualInput, setQualInput] = useState('');

  const addQual = () => {
    const t = qualInput.trim();
    if (t && !qualTags.includes(t)) setQualTags((prev) => [...prev, t]);
    setQualInput('');
  };

  // ── Work Experience ──────────────────────────────────────────────────────────

  const emptyWork = (): WorkExperience => ({
    id: crypto.randomUUID(), title: '', company: '', startYear: new Date().getFullYear(),
  });
  const [workExp, setWorkExp] = useState<WorkExperience[]>(
    profile.workExperiences?.length ? profile.workExperiences : [emptyWork()],
  );

  const updateWork = (idx: number, field: keyof WorkExperience, val: string | number | boolean) =>
    setWorkExp((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: val } : e));

  // ── Education ────────────────────────────────────────────────────────────────

  const emptyEdu = (): Education => ({
    id: crypto.randomUUID(), institution: '', degree: '',
  });
  const [educations, setEducations] = useState<Education[]>(
    profile.educations?.length ? profile.educations : [emptyEdu()],
  );

  const updateEdu = (idx: number, field: keyof Education, val: string | number) =>
    setEducations((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: val } : e));

  // ── Credentials ──────────────────────────────────────────────────────────────

  const [credentials, setCredentials] = useState<Credential[]>(profile.credentials ?? []);
  const [credUploading, setCredUploading] = useState(false);
  const [credName, setCredName] = useState('');
  const [credInstitution, setCredInstitution] = useState('');
  const [credYear, setCredYear] = useState('');
  const credInputRef = useRef<HTMLInputElement>(null);

  const handleCredUpload = async (file: File) => {
    if (!credName || !credInstitution) {
      showToast('Please enter credential name and institution first.', 'error');
      return;
    }
    setCredUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/upload/document`,
        { method: 'POST', body: form },
      );
      const json = (await resp.json()) as { data?: { url: string } };
      if (json.data?.url) {
        const newCred: Credential = {
          id: crypto.randomUUID(),
          name: credName,
          issuingBody: credInstitution,
          year: credYear ? parseInt(credYear, 10) : undefined,
          url: json.data.url,
        };
        const updated = [...credentials, newCred];
        setCredentials(updated);
        await apiClient.patch('/members/me', { credentials: updated });
        void queryClient.invalidateQueries({ queryKey: queryKeys.members.me() });
        showToast('Credential uploaded. Pending verification.', 'success');
        setCredName(''); setCredInstitution(''); setCredYear('');
      }
    } catch {
      showToast('Credential upload failed.', 'error');
    } finally {
      setCredUploading(false);
    }
  };

  // ── Testimonials ─────────────────────────────────────────────────────────────

  const [testimonials, setTestimonials] = useState<Testimonial[]>(profile.testimonials ?? []);
  const [testAuthor, setTestAuthor] = useState('');
  const [testContent, setTestContent] = useState('');
  const [testUploading, setTestUploading] = useState(false);
  const testInputRef = useRef<HTMLInputElement>(null);

  const handleTestUpload = async (file: File) => {
    if (!testAuthor || !testContent) {
      showToast('Please enter author name and testimonial content first.', 'error');
      return;
    }
    setTestUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/upload/document`,
        { method: 'POST', body: form },
      );
      const json = (await resp.json()) as { data?: { url: string } };
      if (json.data?.url) {
        const newTest: Testimonial = {
          id: crypto.randomUUID(),
          authorName: testAuthor,
          content: testContent,
          url: json.data.url,
        } as Testimonial & { url: string };
        const updated = [...testimonials, newTest];
        setTestimonials(updated);
        await apiClient.patch('/members/me', { testimonials: updated });
        void queryClient.invalidateQueries({ queryKey: queryKeys.members.me() });
        showToast('Testimonial uploaded. Pending verification.', 'success');
        setTestAuthor(''); setTestContent('');
      }
    } catch {
      showToast('Testimonial upload failed.', 'error');
    } finally {
      setTestUploading(false);
    }
  };

  // ── Engagements ──────────────────────────────────────────────────────────────

  const emptyEng = (): Engagement => ({
    id: crypto.randomUUID(), type: 'speaking', title: '', organization: '',
  });
  const [engagements, setEngagements] = useState<Engagement[]>(
    profile.engagements?.length ? profile.engagements : [],
  );

  const updateEng = (idx: number, field: keyof Engagement, val: string | number) =>
    setEngagements((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: val } : e));

  // ── Availability ─────────────────────────────────────────────────────────────

  const av = profile.availability;
  const [avDays, setAvDays] = useState<string[]>(av?.days ?? []);
  const [avSlots, setAvSlots] = useState<string[]>(av?.slots ?? []);
  const [avTimezone, setAvTimezone] = useState(av?.timezone ?? 'UTC');
  const [avResponseTime, setAvResponseTime] = useState(av?.responseTime ?? 'Within 24 hours');
  const [avContact, setAvContact] = useState<string[]>(av?.preferredContact ?? []);
  const [avNotes, setAvNotes] = useState(av?.notes ?? '');

  const toggleArr = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  // ── Input class ──────────────────────────────────────────────────────────────

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors';
  const labelCls = 'block text-xs font-medium text-brand-text-secondary mb-1';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="mb-2">
        <h1 className="text-2xl font-bold text-brand-text">Edit Profile</h1>
        <p className="text-sm text-brand-text-secondary mt-1">
          Changes are saved per section. Editing sensitive fields will temporarily remove your verified badge.
        </p>
      </div>

      {/* Photo */}
      <Section
        title="Profile Photo"
        onSave={async () => {}} // handled inline
        isSaving={uploadingPhoto}
        isSensitive={false}
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-text-muted text-2xl font-bold">
                {(profile.user?.firstName?.[0] ?? '?').toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              ref={photoInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handlePhotoUpload(file);
              }}
            />
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-brand-surface-alt disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {uploadingPhoto ? 'Uploading…' : 'Upload photo'}
            </button>
            <p className="text-xs text-brand-text-muted mt-1.5">JPEG, PNG or WebP · Max 5 MB</p>
          </div>
        </div>
      </Section>

      {/* Basic Info */}
      <Section
        title="Basic Information"
        isSensitive={SENSITIVE_FIELDS.includes('headline') || SENSITIVE_FIELDS.includes('bio')}
        isSaving={saving['basic'] ?? false}
        onSave={(sensitive) =>
          saveSection('basic', { designation, headline, bio }, sensitive)
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>First name</label>
            <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Last name</label>
            <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Designation</label>
            <input className={inputCls} value={designation} onChange={(e) => setDesignation(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Headline ({headline.length}/120)</label>
            <input
              className={inputCls} value={headline} maxLength={120}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Bio ({bio.length}/500)</label>
            <textarea
              className={`${inputCls} resize-none`} rows={5} value={bio} maxLength={500}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section
        title="Contact & Fees"
        isSensitive={false}
        isSaving={saving['contact'] ?? false}
        onSave={(sensitive) =>
          saveSection('contact', {
            linkedinUrl,
            feeRangeMin: feeMin ? parseFloat(feeMin) : undefined,
            feeRangeMax: feeMax ? parseFloat(feeMax) : undefined,
          }, sensitive)
        }
      >
        <div className="space-y-4">
          <div>
            <label className={labelCls}>LinkedIn URL</label>
            <input className={inputCls} type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Min consultation fee (USD)</label>
              <input className={inputCls} type="number" min="0" value={feeMin} onChange={(e) => setFeeMin(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Max consultation fee (USD)</label>
              <input className={inputCls} type="number" min="0" value={feeMax} onChange={(e) => setFeeMax(e.target.value)} />
            </div>
          </div>
        </div>
      </Section>

      {/* Location */}
      <Section
        title="Location & Firm"
        isSensitive={false}
        isSaving={saving['location'] ?? false}
        onSave={(sensitive) =>
          saveSection('location', { country, city, firmName, firmSize }, sensitive)
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Country</label>
            <select className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">Select country</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Firm name</label>
            <input className={inputCls} value={firmName} onChange={(e) => setFirmName(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Firm size</label>
            <select className={inputCls} value={firmSize} onChange={(e) => setFirmSize(e.target.value)}>
              <option value="">Select size</option>
              {['Solo', '2–10', '11–50', '51–200', '201–500', '500+'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {/* Services — view only, change request */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-base font-semibold text-brand-text mb-4">Services</h2>
        {profile.primaryService && (
          <div className="mb-3">
            <span className="text-xs font-medium text-brand-text-muted uppercase tracking-wide">Primary</span>
            <p className="text-sm text-brand-text mt-0.5 font-medium">{profile.primaryService.name}</p>
          </div>
        )}
        {(profile.secondaryServices?.length ?? 0) > 0 && (
          <div className="mb-4">
            <span className="text-xs font-medium text-brand-text-muted uppercase tracking-wide">Secondary</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.secondaryServices?.map((s) => (
                <span key={s.id} className="px-2 py-0.5 bg-brand-blue-subtle text-brand-blue text-xs rounded-full">{s.name}</span>
              ))}
            </div>
          </div>
        )}
        <button className="text-sm text-brand-blue hover:underline">
          Request service change
        </button>
        <p className="text-xs text-brand-text-muted mt-1">Service changes are reviewed by our team. Your current service remains active until approved.</p>
      </div>

      {/* Qualifications */}
      <Section
        title="Qualifications"
        isSensitive
        isSaving={saving['qualifications'] ?? false}
        onSave={(sensitive) =>
          saveSection('qualifications', {
            qualifications: qualTags.map((name) => ({ id: crypto.randomUUID(), name })),
          }, sensitive)
        }
      >
        <div className="flex flex-wrap gap-2 mb-3">
          {qualTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-blue-subtle text-brand-blue text-sm rounded-full">
              {tag}
              <button onClick={() => setQualTags(qualTags.filter((t) => t !== tag))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className={inputCls}
            placeholder="Add qualification…"
            value={qualInput}
            onChange={(e) => setQualInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addQual(); } }}
          />
          <button
            onClick={addQual}
            className="px-3 py-2 bg-brand-surface-alt border border-slate-200 rounded-lg text-sm hover:bg-slate-100 transition-colors"
          >
            Add
          </button>
        </div>
      </Section>

      {/* Work Experience */}
      <Section
        title="Work Experience"
        isSensitive
        isSaving={saving['work'] ?? false}
        onSave={(sensitive) => saveSection('work', { workExperiences: workExp }, sensitive)}
      >
        <div className="space-y-5">
          {workExp.map((exp, idx) => (
            <div key={exp.id} className="border border-slate-100 rounded-lg p-4 relative">
              <button
                className="absolute top-3 right-3 text-brand-text-muted hover:text-red-500 transition-colors"
                onClick={() => setWorkExp(workExp.filter((_, i) => i !== idx))}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Job title</label>
                  <input className={inputCls} value={exp.title} onChange={(e) => updateWork(idx, 'title', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Company</label>
                  <input className={inputCls} value={exp.company} onChange={(e) => updateWork(idx, 'company', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Start year</label>
                  <input className={inputCls} type="number" value={exp.startYear} onChange={(e) => updateWork(idx, 'startYear', parseInt(e.target.value, 10))} />
                </div>
                <div>
                  <label className={labelCls}>End year</label>
                  <input
                    className={inputCls} type="number"
                    value={exp.isCurrent ? '' : (exp.endYear ?? '')}
                    disabled={exp.isCurrent}
                    onChange={(e) => updateWork(idx, 'endYear', parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox" id={`current-${idx}`} checked={exp.isCurrent ?? false}
                    onChange={(e) => updateWork(idx, 'isCurrent', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor={`current-${idx}`} className="text-sm text-brand-text-secondary">Current role</label>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Description (optional)</label>
                  <textarea
                    className={`${inputCls} resize-none`} rows={2} maxLength={500}
                    value={exp.description ?? ''}
                    onChange={(e) => updateWork(idx, 'description', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          {workExp.length < 5 && (
            <button
              onClick={() => setWorkExp([...workExp, emptyWork()])}
              className="flex items-center gap-2 text-sm text-brand-blue hover:underline"
            >
              <Plus className="w-4 h-4" /> Add experience
            </button>
          )}
        </div>
      </Section>

      {/* Education */}
      <Section
        title="Education"
        isSensitive
        isSaving={saving['education'] ?? false}
        onSave={(sensitive) => saveSection('education', { educations }, sensitive)}
      >
        <div className="space-y-5">
          {educations.map((edu, idx) => (
            <div key={edu.id} className="border border-slate-100 rounded-lg p-4 relative">
              <button
                className="absolute top-3 right-3 text-brand-text-muted hover:text-red-500 transition-colors"
                onClick={() => setEducations(educations.filter((_, i) => i !== idx))}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Institution</label>
                  <input className={inputCls} value={edu.institution} onChange={(e) => updateEdu(idx, 'institution', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Degree</label>
                  <input className={inputCls} value={edu.degree} onChange={(e) => updateEdu(idx, 'degree', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Field of study</label>
                  <input className={inputCls} value={edu.field ?? ''} onChange={(e) => updateEdu(idx, 'field', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Start year</label>
                    <input className={inputCls} type="number" value={edu.startYear ?? ''} onChange={(e) => updateEdu(idx, 'startYear', parseInt(e.target.value, 10))} />
                  </div>
                  <div>
                    <label className={labelCls}>End year</label>
                    <input className={inputCls} type="number" value={edu.endYear ?? ''} onChange={(e) => updateEdu(idx, 'endYear', parseInt(e.target.value, 10))} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {educations.length < 3 && (
            <button
              onClick={() => setEducations([...educations, emptyEdu()])}
              className="flex items-center gap-2 text-sm text-brand-blue hover:underline"
            >
              <Plus className="w-4 h-4" /> Add education
            </button>
          )}
        </div>
      </Section>

      {/* Credentials */}
      <Section
        title="Credential Documents"
        isSensitive
        isSaving={saving['credentials'] ?? false}
        onSave={async () => {}} // handled inline via upload
      >
        {credentials.length > 0 && (
          <ul className="space-y-2 mb-5">
            {credentials.map((cred) => (
              <li key={cred.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-brand-text">{cred.name}</p>
                  <p className="text-xs text-brand-text-muted">{cred.issuingBody} {cred.year ? `· ${cred.year}` : ''}</p>
                </div>
                {cred.isVerified && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        {credentials.length < 5 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Credential name</label>
                <input className={inputCls} value={credName} onChange={(e) => setCredName(e.target.value)} placeholder="e.g. CFA Level III" />
              </div>
              <div>
                <label className={labelCls}>Institution</label>
                <input className={inputCls} value={credInstitution} onChange={(e) => setCredInstitution(e.target.value)} placeholder="e.g. CFA Institute" />
              </div>
              <div>
                <label className={labelCls}>Year</label>
                <input className={inputCls} type="number" value={credYear} onChange={(e) => setCredYear(e.target.value)} placeholder="2022" />
              </div>
            </div>
            <input
              type="file" accept="application/pdf,image/*" className="hidden"
              ref={credInputRef}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleCredUpload(f); }}
            />
            <button
              onClick={() => credInputRef.current?.click()}
              disabled={credUploading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-brand-surface-alt disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {credUploading ? 'Uploading…' : 'Upload document'}
            </button>
            <p className="text-xs text-brand-text-muted">PDF or image · Max 10 MB · After uploading, pending ops verification.</p>
          </div>
        )}
      </Section>

      {/* Testimonials */}
      <Section
        title="Testimonials"
        isSensitive={false}
        isSaving={saving['testimonials'] ?? false}
        onSave={async () => {}} // handled inline via upload
      >
        {testimonials.length > 0 && (
          <ul className="space-y-2 mb-5">
            {testimonials.map((t) => (
              <li key={t.id} className="flex items-start justify-between p-3 border border-slate-100 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-brand-text">{t.authorName}</p>
                  <p className="text-xs text-brand-text-muted line-clamp-2 mt-0.5">{t.content}</p>
                </div>
                {t.isVerified && (
                  <span className="shrink-0 flex items-center gap-1 text-xs text-green-600 font-medium ml-4">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Author name</label>
            <input className={inputCls} value={testAuthor} onChange={(e) => setTestAuthor(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Testimonial content</label>
            <textarea className={`${inputCls} resize-none`} rows={3} value={testContent} onChange={(e) => setTestContent(e.target.value)} />
          </div>
          <input
            type="file" accept="application/pdf,image/*" className="hidden"
            ref={testInputRef}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleTestUpload(f); }}
          />
          <button
            onClick={() => testInputRef.current?.click()}
            disabled={testUploading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-brand-surface-alt disabled:opacity-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {testUploading ? 'Uploading…' : 'Upload supporting document'}
          </button>
        </div>
      </Section>

      {/* Engagements */}
      <Section
        title="Speaking, Publications & Awards"
        isSensitive={false}
        isSaving={saving['engagements'] ?? false}
        onSave={(sensitive) => saveSection('engagements', { engagements }, sensitive)}
      >
        <div className="space-y-4">
          {engagements.map((eng, idx) => (
            <div key={eng.id} className="border border-slate-100 rounded-lg p-4 relative">
              <button
                className="absolute top-3 right-3 text-brand-text-muted hover:text-red-500 transition-colors"
                onClick={() => setEngagements(engagements.filter((_, i) => i !== idx))}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Type</label>
                  <select className={inputCls} value={eng.type} onChange={(e) => updateEng(idx, 'type', e.target.value)}>
                    <option value="speaking">Speaking</option>
                    <option value="publication">Publication</option>
                    <option value="award">Award</option>
                    <option value="media">Media</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Title</label>
                  <input className={inputCls} value={eng.title} onChange={(e) => updateEng(idx, 'title', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Organization</label>
                  <input className={inputCls} value={eng.organization ?? ''} onChange={(e) => updateEng(idx, 'organization', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Year</label>
                  <input className={inputCls} type="number" value={eng.year ?? ''} onChange={(e) => updateEng(idx, 'year', parseInt(e.target.value, 10))} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>URL (optional)</label>
                  <input className={inputCls} type="url" value={eng.url ?? ''} onChange={(e) => updateEng(idx, 'url', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          {engagements.length < 5 && (
            <button
              onClick={() => setEngagements([...engagements, emptyEng()])}
              className="flex items-center gap-2 text-sm text-brand-blue hover:underline"
            >
              <Plus className="w-4 h-4" /> Add engagement
            </button>
          )}
        </div>
      </Section>

      {/* Availability */}
      <Section
        title="Availability"
        isSensitive={false}
        isSaving={saving['availability'] ?? false}
        onSave={(sensitive) =>
          saveSection('availability', {
            availability: {
              days: avDays, slots: avSlots, timezone: avTimezone,
              responseTime: avResponseTime, preferredContact: avContact, notes: avNotes,
            },
          }, sensitive)
        }
      >
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Available days</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {AVAILABILITY_DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleArr(avDays, setAvDays, day)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    avDays.includes(day)
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'border-slate-200 text-brand-text-secondary hover:border-brand-blue'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Time slots</label>
            <div className="flex gap-2 mt-1">
              {AVAILABILITY_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => toggleArr(avSlots, setAvSlots, slot)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    avSlots.includes(slot)
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'border-slate-200 text-brand-text-secondary hover:border-brand-blue'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Timezone</label>
              <select className={inputCls} value={avTimezone} onChange={(e) => setAvTimezone(e.target.value)}>
                {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Response time</label>
              <select className={inputCls} value={avResponseTime} onChange={(e) => setAvResponseTime(e.target.value)}>
                {RESPONSE_TIMES.map((rt) => <option key={rt}>{rt}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Preferred contact methods</label>
            <div className="flex gap-2 mt-1">
              {CONTACT_METHODS.map((method) => (
                <button
                  key={method}
                  onClick={() => toggleArr(avContact, setAvContact, method)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    avContact.includes(method)
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'border-slate-200 text-brand-text-secondary hover:border-brand-blue'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes ({avNotes.length}/200)</label>
            <textarea
              className={`${inputCls} resize-none`} rows={3} maxLength={200}
              value={avNotes} onChange={(e) => setAvNotes(e.target.value)}
              placeholder="Any specific scheduling notes…"
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
