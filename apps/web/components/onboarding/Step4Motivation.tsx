'use client';

import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

const QUESTIONS = [
  {
    field: 'motivationWhy' as const,
    label: 'Why do you want to join the Expertly network?',
    placeholder:
      "e.g. I'm looking to connect with clients who need specialist expertise in cross-border M&A, and to build my professional profile within a trusted, verified network of finance and legal practitioners.",
    hint: "Tell us what draws you to Expertly specifically — not just professional networks in general.",
  },
  {
    field: 'motivationEngagement' as const,
    label: 'What types of clients or engagements are you looking to take on?',
    placeholder:
      "e.g. I'm interested in advisory mandates for mid-market companies navigating regulatory change, fractional CFO engagements, and mentoring junior practitioners in my field.",
    hint: 'Be specific — this helps us match you to the right clients and opportunities on the platform.',
  },
  {
    field: 'motivationUnique' as const,
    label: 'What makes your perspective or approach distinctive?',
    placeholder:
      "e.g. I've spent 12 years exclusively advising distressed businesses, which gives me a lens most generalists don't have. I bring both legal and financial fluency to each engagement and I'm known for cutting through complexity quickly.",
    hint: "Tell us something that wouldn't be obvious from your CV — a niche, a way of working, or a unique combination of skills.",
  },
] as const;

const MAX_CHARS = 500;

export function Step4Motivation({ onBack, onNext }: Props) {
  const { formData, setStep4 } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [answers, setAnswers] = useState({
    motivationWhy: formData.motivationWhy,
    motivationEngagement: formData.motivationEngagement,
    motivationUnique: formData.motivationUnique,
  });

  function updateAnswer(field: keyof typeof answers, value: string) {
    setAnswers((a) => ({ ...a, [field]: value.slice(0, MAX_CHARS) }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  }

  function handleNext() {
    const errs: Record<string, string> = {};
    QUESTIONS.forEach(({ field, label }) => {
      if (!answers[field].trim()) {
        errs[field] = `Please answer: ${label}`;
      }
    });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStep4(answers);
    onNext();
  }

  return (
    <div className="space-y-6">
      {/* Intro card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-blue-subtle border border-blue-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Your Motivation</h2>
            <p className="text-sm text-brand-text-muted mt-1 leading-relaxed">
              These three questions help our review team understand who you are beyond your credentials.
              There are no right answers — we&apos;re looking for authenticity, self-awareness, and genuine fit with the network.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {QUESTIONS.map(({ field, label, placeholder, hint }, idx) => (
            <div key={field}>
              <div className="flex items-start gap-3 mb-2">
                <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <label className="text-sm font-semibold text-brand-navy leading-snug">
                  {label} <span className="text-red-500">*</span>
                </label>
              </div>
              <p className="text-xs text-brand-text-muted mb-2 ml-9">{hint}</p>
              <div className="ml-9">
                <textarea
                  value={answers[field]}
                  onChange={(e) => updateAnswer(field, e.target.value)}
                  placeholder={placeholder}
                  rows={4}
                  className={`input-base w-full resize-none text-sm leading-relaxed ${errors[field] ? 'border-red-300' : ''}`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors[field] ? (
                    <p className="text-xs text-red-500">{errors[field]}</p>
                  ) : (
                    <span />
                  )}
                  <span className={`text-xs tabular-nums ${answers[field].length > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-brand-text-muted'}`}>
                    {answers[field].length}/{MAX_CHARS}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
          Review Application
          <svg className="ml-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
