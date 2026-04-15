'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { apiClient } from '@/lib/apiClient';
// Local taxonomy types (API returns snake_case transformed to camelCase by interceptor)
interface ServiceItem { id: string; name: string; categoryId?: string; }
interface CategoryItem { id: string; name: string; }

type ToastState = { message: string; type: 'success' | 'error' } | null;

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
  const [feeMax, setFeeMax] = useState<number | ''>(() => formData.consultationFeeMaxUsd || '');
  const [pref1, setPref1] = useState(formData.primaryServiceId);
  const [pref2, setPref2] = useState(formData.secondaryServiceIds[0] ?? '');
  const [pref3, setPref3] = useState(formData.secondaryServiceIds[1] ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

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

  // ── Next ────────────────────────────────────────────────────────────────────
  function handleNext() {
    const errs: Record<string, string> = {};
    if (!pref1) errs.primaryService = 'Please select your 1st preference service';
    if (feeMin === '') errs.feeMin = 'Minimum consultation rate is required';
    if (feeMax === '') errs.feeMax = 'Maximum consultation rate is required';
    if (feeMin !== '' && feeMax !== '' && Number(feeMax) <= Number(feeMin)) errs.feeMax = 'Maximum must be greater than minimum';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStep2({ consultationFeeMinUsd: feeMin as number, consultationFeeMaxUsd: feeMax !== '' ? feeMax as number : undefined });
    setStep3({
      primaryServiceId: pref1,
      secondaryServiceIds: [pref2, pref3].filter(Boolean),
      keyEngagements: [],
      engagements: [],
      availability: formData.availability,
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
            {categories.filter((cat) => !cat.name.toLowerCase().startsWith('other') && cat.name !== 'Legal - Industries').map((cat) => (
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
                  : categories.filter((cat) => cat.name !== 'Legal - Industries').map((cat) => {
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

      </div>

      {/* ── Consultation Rates ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <h2 className="text-base font-bold text-brand-navy mb-1">Consultation Rates <span className="text-red-500">*</span></h2>
        <p className="text-xs text-brand-text-muted mb-5">Your typical fee range per hour consultation (in USD).</p>
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
            <label className="block text-xs font-semibold text-brand-text-secondary mb-1.5">Max (USD) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min={0}
              value={feeMax}
              onChange={(e) => { setFeeMax(e.target.value === '' ? '' : Number(e.target.value)); setErrors((err) => ({ ...err, feeMax: '' })); }}
              placeholder="e.g. 2000"
              className={`input-base w-full ${errors.feeMax ? 'border-red-300' : ''}`}
            />
            {errors.feeMax && <p className="mt-1 text-xs text-red-500">{errors.feeMax}</p>}
          </div>
        </div>
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
          Next: Review
          <svg className="ml-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
