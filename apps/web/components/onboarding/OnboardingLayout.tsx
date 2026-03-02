'use client';

import { useOnboardingStore } from '@/stores/onboardingStore';
import { Step1Identity } from './Step1Identity';
import { Step2Experience } from './Step2Experience';
import { Step3Services } from './Step3Services';

const STEPS = [
  { number: 1 as const, label: 'Identity' },
  { number: 2 as const, label: 'Experience' },
  { number: 3 as const, label: 'Services' },
];

export function OnboardingLayout() {
  const { currentStep, setStep } = useOnboardingStore();

  function handleBack() {
    if (currentStep > 1) setStep((currentStep - 1) as 1 | 2 | 3);
  }

  function handleNext() {
    if (currentStep < 3) setStep((currentStep + 1) as 1 | 2 | 3);
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* ── Hero band ─────────────────────────────────────── */}
      <div className="bg-brand-navy py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-label mb-2 text-center">Membership Application</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
            Apply to Join Expertly
          </h1>

          {/* ── Step progress bar ─────────────────────────── */}
          <div className="mt-8 flex items-center justify-center gap-0">
            {STEPS.map((step, idx) => {
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;

              return (
                <div key={step.number} className="flex items-center">
                  {/* Connector line before (not first) */}
                  {idx > 0 && (
                    <div
                      className={`h-0.5 w-12 sm:w-20 transition-colors duration-300 ${
                        isCompleted ? 'bg-brand-blue' : 'bg-white/20'
                      }`}
                    />
                  )}

                  {/* Step circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-brand-navy border-brand-blue'
                          : isCurrent
                          ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/40'
                          : 'bg-transparent border-white/30 text-white/40'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="h-4 w-4 text-brand-blue" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className={isCurrent ? 'text-white' : 'text-white/40'}>
                          {step.number}
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-xs font-medium transition-colors duration-200 ${
                        isCurrent
                          ? 'text-white'
                          : isCompleted
                          ? 'text-brand-blue'
                          : 'text-white/30'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Form area ──────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {currentStep === 1 && <Step1Identity onNext={handleNext} />}
        {currentStep === 2 && <Step2Experience onBack={handleBack} onNext={handleNext} />}
        {currentStep === 3 && <Step3Services onBack={handleBack} />}
      </div>
    </div>
  );
}
