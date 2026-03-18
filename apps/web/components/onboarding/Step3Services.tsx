'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { apiClient } from '@/lib/apiClient';
import type { EngagementEntry, AvailabilityData } from '@/stores/onboardingStore';
// Local taxonomy types (API returns snake_case transformed to camelCase by interceptor)
interface ServiceItem { id: string; name: string; categoryId?: string; }
interface CategoryItem { id: string; name: string; }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ── Engagement boost lookup ──────────────────────────────────────────────────
const BOOST_TABLE = [
  { minH: 12, pct: 72 },
  { minH: 10, pct: 60 },
  { minH: 8,  pct: 45 },
  { minH: 6,  pct: 30 },
  { minH: 4,  pct: 15 },
  { minH: 0,  pct: 0  },
];
function getBoost(hours: number) {
  return BOOST_TABLE.find((b) => hours >= b.minH)?.pct ?? 0;
}
function fmtHour(h: number) {
  if (h === 0 || h === 24) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}
function engagementInsight(start: number, end: number): string {
  const hours = end - start;
  if (hours < 1) return 'Set your available hours window to see your reach estimate.';
  const cur = getBoost(hours);
  const ext = getBoost(hours + 2);
  const delta = ext - cur;
  if (delta > 0) {
    return `You're available ${hours} hrs/day (+${cur}% reach estimate). Extending by 2 hours could increase consultation requests by an additional ${delta}%.`;
  }
  return `You're available ${hours} hrs/day. Great — you're in the top availability tier for consultation requests!`;
}

// ── Time range slider ────────────────────────────────────────────────────────
function TimeRangeSlider({
  startHour, endHour, onStart, onEnd,
}: { startHour: number; endHour: number; onStart: (h: number) => void; onEnd: (h: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'start' | 'end' | null>(null);
  // Refs hold the latest values so the stable global listener always reads fresh state
  const startRef = useRef(startHour);
  const endRef   = useRef(endHour);
  const onStartRef = useRef(onStart);
  const onEndRef   = useRef(onEnd);
  useEffect(() => { startRef.current = startHour; },  [startHour]);
  useEffect(() => { endRef.current   = endHour; },    [endHour]);
  useEffect(() => { onStartRef.current = onStart; },  [onStart]);
  useEffect(() => { onEndRef.current   = onEnd; },    [onEnd]);

  // Register global listeners once — uses refs so no dependency array churn
  useEffect(() => {
    function getHour(clientX: number) {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return 0;
      return Math.round(Math.max(0, Math.min(24, ((clientX - rect.left) / rect.width) * 24)));
    }
    function onMove(clientX: number) {
      if (!dragging.current) return;
      const h = getHour(clientX);
      if (dragging.current === 'start') onStartRef.current(Math.min(h, endRef.current - 1));
      else                              onEndRef.current(Math.max(h, startRef.current + 1));
    }
    function onMouseMove(e: MouseEvent) { onMove(e.clientX); }
    function onTouchMove(e: TouchEvent) { if (e.touches[0]) onMove(e.touches[0].clientX); }
    function onUp() { dragging.current = null; }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend',  onUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend',  onUp);
    };
  }, []); // runs once — fresh values always come from refs

  const leftPct  = (startHour / 24) * 100;
  const rightPct = ((24 - endHour) / 24) * 100;
  const thumbCls = 'absolute w-5 h-5 rounded-full bg-white border-2 border-brand-blue shadow-md -translate-x-1/2 cursor-grab active:cursor-grabbing z-10';

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-bold text-brand-navy">{fmtHour(startHour)}</span>
        <span className="text-xs text-brand-text-muted">{endHour - startHour} hrs/day</span>
        <span className="text-sm font-bold text-brand-navy">{fmtHour(endHour)}</span>
      </div>
      <div ref={trackRef} className="relative h-10 flex items-center select-none">
        <div className="absolute inset-x-0 h-1.5 bg-gray-200 rounded-full" />
        <div
          className="absolute h-1.5 bg-brand-blue rounded-full"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
        <div
          className={thumbCls}
          style={{ left: `${leftPct}%` }}
          onMouseDown={(e) => { e.preventDefault(); dragging.current = 'start'; }}
          onTouchStart={() => { dragging.current = 'start'; }}
        />
        <div
          className={thumbCls}
          style={{ left: `${(endHour / 24) * 100}%` }}
          onMouseDown={(e) => { e.preventDefault(); dragging.current = 'end'; }}
          onTouchStart={() => { dragging.current = 'end'; }}
        />
      </div>
      <div className="flex justify-between text-xs text-brand-text-muted mt-1">
        {[0, 6, 12, 18, 24].map((h) => <span key={h}>{fmtHour(h)}</span>)}
      </div>
    </div>
  );
}
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
  onNext: () => void;
}

export function Step3Services({ onBack, onNext }: Props) {
  const { formData, setStep2, setStep3 } = useOnboardingStore();

  const [toast, setToast] = useState<ToastState>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Local state
  const [feeMin, setFeeMin] = useState<number | ''>(formData.consultationFeeMinUsd);
  const [feeMax, setFeeMax] = useState<number | ''>(formData.consultationFeeMaxUsd);
  const [pref1, setPref1] = useState(formData.primaryServiceId);
  const [pref2, setPref2] = useState(formData.secondaryServiceIds[0] ?? '');
  const [pref3, setPref3] = useState(formData.secondaryServiceIds[1] ?? '');
  const [keyEngagements, setKeyEngagements] = useState<string[]>(
    formData.keyEngagements.length > 0 ? formData.keyEngagements : [''],
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [engagements, setEngagements] = useState<EngagementEntry[]>(formData.engagements);
  const [availability, setAvailability] = useState<AvailabilityData>({
    ...formData.availability,
    startHour: formData.availability.startHour ?? 9,
    endHour:   formData.availability.endHour   ?? 17,
  });

  // Fetch taxonomy
  const { data: categories = [] } = useQuery<CategoryItem[]>({
    queryKey: ['service-categories'],
    queryFn: () => apiClient.get<CategoryItem[]>('/taxonomy/categories'),
    staleTime: 3600_000,
  });
  const { data: services = [] } = useQuery<ServiceItem[]>({
    queryKey: ['services'],
    queryFn: () => apiClient.get<ServiceItem[]>('/taxonomy/services'),
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

  // ── Next ────────────────────────────────────────────────────────────────────
  function handleNext() {
    const cleanKeyEngagements = keyEngagements.map((s) => s.trim()).filter(Boolean);

    const errs: Record<string, string> = {};
    if (!pref1) errs.primaryService = 'Please select your 1st preference service';
    if (cleanKeyEngagements.length === 0) errs.keyEngagements = 'Add at least one reason why you are the best for this service area';
    if (feeMin === '') errs.feeMin = 'Minimum consultation rate is required';
    if (availability.days.length === 0) errs.availabilityDays = 'Select at least one available day';
    if (!availability.timezone) errs.availabilityTimezone = 'Please select your timezone';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Save fee values (stored in Step2Data even though collected in Step3 UI)
    setStep2({ consultationFeeMinUsd: feeMin as number, consultationFeeMaxUsd: feeMax !== '' ? feeMax as number : undefined });
    setStep3({
      primaryServiceId: pref1,
      secondaryServiceIds: [pref2, pref3].filter(Boolean),
      keyEngagements: cleanKeyEngagements,
      engagements,
      availability,
    });
    onNext();
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
        <h2 className="text-lg font-bold text-brand-navy mb-1">Services</h2>
        <p className="text-xs text-brand-text-muted mb-5">Select a category to filter, then rank your top three service preferences.</p>

        {/* Category filter pills — click to filter, click again to clear */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.filter((cat) => !cat.name.toLowerCase().startsWith('other')).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? '' : cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategoryId === cat.id
                    ? 'bg-brand-navy border-brand-navy text-white'
                    : 'bg-white border-gray-200 text-brand-text hover:border-brand-navy'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Ranked preference dropdowns */}
        {(['1st Preference', '2nd Preference', '3rd Preference'] as const).map((label, idx) => {
          const value = idx === 0 ? pref1 : idx === 1 ? pref2 : pref3;
          const setter = idx === 0 ? setPref1 : idx === 1 ? setPref2 : setPref3;
          const others = [pref1, pref2, pref3].filter((_, i) => i !== idx);
          const filtered = selectedCategoryId
            ? services.filter((s) => s.categoryId === selectedCategoryId)
            : services;

          return (
            <div key={label} className={idx < 2 ? 'mb-4' : ''}>
              <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
                {label}{idx === 0 && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <select
                value={value}
                onChange={(e) => {
                  setter(e.target.value);
                  if (idx === 0) setErrors((err) => ({ ...err, primaryService: '' }));
                }}
                className={`input-base w-full ${idx === 0 && errors.primaryService ? 'border-red-300' : ''}`}
              >
                <option value="">Select service…</option>
                {selectedCategoryId
                  ? filtered
                      .filter((s) => !others.includes(s.id))
                      .map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                  : categories.map((cat) => {
                      const catServices = filtered.filter(
                        (s) => s.categoryId === cat.id && !others.includes(s.id),
                      );
                      if (catServices.length === 0) return null;
                      return (
                        <optgroup key={cat.id} label={cat.name}>
                          {catServices.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </optgroup>
                      );
                    })
                }
              </select>
              {idx === 0 && errors.primaryService && (
                <p className="mt-1 text-xs text-red-500">{errors.primaryService}</p>
              )}
            </div>
          );
        })}

        {/* ── Key Engagements (why you for this category) ── */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-brand-text-secondary">
              Why are you the best person for this service area? <span className="text-red-500">*</span>
            </p>
            <span className="text-xs text-brand-text-muted">{keyEngagements.filter(Boolean).length}/5</span>
          </div>
          <p className="text-xs text-brand-text-muted mb-3">
            Add up to 5 specific reasons — unique expertise, notable deals, specialist knowledge, or track record that sets you apart in your chosen field.
          </p>
          {errors.keyEngagements && <p className="mb-2 text-xs text-red-500">{errors.keyEngagements}</p>}
          <div className="space-y-2">
            {keyEngagements.map((point, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-navy text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => {
                    const next = [...keyEngagements];
                    next[i] = e.target.value;
                    setKeyEngagements(next);
                  }}
                  placeholder={[
                    'e.g. Led 20+ cross-border M&A transactions across APAC',
                    'e.g. Advised Fortune 500 clients on transfer pricing disputes',
                    'e.g. Specialist in IFRS 9 implementation for banking sector',
                    'e.g. 15 years exclusively in private equity tax structuring',
                    'e.g. Recognised expert witness in international arbitration',
                  ][i] ?? 'Add a reason…'}
                  maxLength={160}
                  className="input-base flex-1 text-sm"
                />
                {keyEngagements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setKeyEngagements(keyEngagements.filter((_, j) => j !== i))}
                    className="text-brand-text-muted hover:text-red-400 transition-colors shrink-0"
                    aria-label="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {keyEngagements.length < 5 && (
            <button
              type="button"
              onClick={() => setKeyEngagements([...keyEngagements, ''])}
              className="mt-2 text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors"
            >
              + Add another reason
            </button>
          )}
        </div>
      </div>

      {/* ── Professional Engagements ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Professional Engagements</h2>
            <p className="text-xs text-brand-text-muted mt-0.5">Speaking appearances, publications, awards, and media features — up to 5.</p>
          </div>
          {engagements.length < 5 && (
            <button type="button" onClick={addEngagement} className="btn-outline text-sm px-4 py-2 shrink-0 ml-4">+ Add</button>
          )}
        </div>

        {engagements.length === 0 ? (
          <p className="text-sm text-brand-text-muted text-center py-4">No engagements added yet. Click <span className="font-semibold">+ Add</span> to include your first.</p>
        ) : (
          <div className="space-y-4">
            {engagements.map((eng, engIdx) => (
              <div key={eng.id} className="rounded-xl border border-gray-100 bg-brand-surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-brand-text-secondary">Engagement {engIdx + 1}</span>
                  <button type="button" onClick={() => removeEngagement(eng.id)} className="text-xs font-medium text-red-400 hover:text-red-600">Remove</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <input type="text" value={eng.title} onChange={(e) => updateEngagement(eng.id, 'title', e.target.value)} placeholder="Talk, article, or award title" className="input-base w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-text-muted mb-1">Organisation / Publication</label>
                    <input type="text" value={eng.organization} onChange={(e) => updateEngagement(eng.id, 'organization', e.target.value)} placeholder="e.g. TEDx, Forbes, ICAI" className="input-base w-full text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">Year</label>
                      <select
                        value={eng.year}
                        onChange={(e) => updateEngagement(eng.id, 'year', e.target.value === '' ? '' : Number(e.target.value))}
                        className="input-base w-full text-sm"
                      >
                        <option value="">Year</option>
                        {Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-brand-text-muted mb-1">Link (optional)</label>
                      <input type="url" value={eng.url} onChange={(e) => updateEngagement(eng.id, 'url', e.target.value)} placeholder="https://…" className="input-base w-full text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {engagements.length >= 5 && (
          <p className="text-xs text-brand-text-muted text-center mt-3">Maximum of 5 engagements reached.</p>
        )}
      </div>

      {/* ── Consultation Rates ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h2 className="text-base font-bold text-brand-navy mb-1">Consultation Rates <span className="text-red-500">*</span></h2>
        <p className="text-xs text-brand-text-muted mb-5">Your typical fee range per consultation (in USD).</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
              Min (USD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={feeMin}
              onChange={(e) => { setFeeMin(e.target.value === '' ? '' : Number(e.target.value)); setErrors((err) => ({ ...err, feeMin: '' })); }}
              placeholder="e.g. 500"
              className={`input-base w-full ${errors.feeMin ? 'border-red-300' : ''}`}
            />
            {errors.feeMin && <p className="mt-1 text-xs text-red-500">{errors.feeMin}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">Max (USD)</label>
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
      </div>

      {/* ── Availability ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h2 className="text-base font-bold text-brand-navy mb-5">Availability <span className="text-red-500">*</span></h2>

        {/* Working days */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-brand-text-secondary mb-2">
            Available days <span className="text-red-500">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => { toggleDay(day); setErrors((err) => ({ ...err, availabilityDays: '' })); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  availability.days.includes(day)
                    ? 'bg-brand-blue border-brand-blue text-white'
                    : errors.availabilityDays
                    ? 'bg-white border-red-200 text-brand-text hover:border-brand-blue'
                    : 'bg-white border-gray-200 text-brand-text hover:border-brand-blue'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          {errors.availabilityDays && <p className="mt-1.5 text-xs text-red-500">{errors.availabilityDays}</p>}
        </div>

        {/* Timezone */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">
            Timezone <span className="text-red-500">*</span>
          </label>
          <select
            value={availability.timezone}
            onChange={(e) => { setAvailability((a) => ({ ...a, timezone: e.target.value })); setErrors((err) => ({ ...err, availabilityTimezone: '' })); }}
            className={`input-base w-full sm:w-72 ${errors.availabilityTimezone ? 'border-red-300' : ''}`}
          >
            <option value="">Select timezone</option>
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
          </select>
          {errors.availabilityTimezone && <p className="mt-1 text-xs text-red-500">{errors.availabilityTimezone}</p>}
        </div>

        {/* Available hours slider */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-brand-text-secondary mb-4">Available hours</p>
          <TimeRangeSlider
            startHour={availability.startHour}
            endHour={availability.endHour}
            onStart={(h) => setAvailability((a) => ({ ...a, startHour: h }))}
            onEnd={(h) => setAvailability((a) => ({ ...a, endHour: h }))}
          />
        </div>

        {/* Engagement insight */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 mb-6">
          <svg className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-xs text-brand-text-secondary leading-relaxed">
            {engagementInsight(availability.startHour, availability.endHour)}
          </p>
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-brand-text-secondary">Availability notes <span className="font-normal text-brand-text-muted">(optional)</span></label>
            <span className="text-xs text-brand-text-muted">{availability.notes.length}/200</span>
          </div>
          <textarea
            value={availability.notes}
            onChange={(e) => setAvailability((a) => ({ ...a, notes: e.target.value.slice(0, 200) }))}
            placeholder="Any additional context about your availability…"
            rows={3}
            className="input-base w-full resize-none"
          />
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
        <button type="button" onClick={handleNext} className="btn-primary px-8 py-3 text-base">
          Next: Your Motivation
          <svg className="ml-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
