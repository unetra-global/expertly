'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { getBrowserClient } from '@/lib/supabase';
import { Step1Identity } from './Step1Identity';
import { Step2Experience } from './Step2Experience';
import { Step3Services } from './Step3Services';
import { Step4Motivation } from './Step4Motivation';
import { Step5Review } from './Step5Review';

const STEPS = [
  { number: 1 as const, label: 'Identity' },
  { number: 2 as const, label: 'Experience' },
  { number: 3 as const, label: 'Services' },
  { number: 4 as const, label: 'Motivation' },
  { number: 5 as const, label: 'Review' },
];

type Step = 1 | 2 | 3 | 4 | 5;

export function OnboardingLayout() {
  const { currentStep, setStep, applicationId } = useOnboardingStore();
  // Once submitted, lock the user to step 5 — read-only review
  const isLocked = !!applicationId;

  // null = checking, true = linked, false = not linked
  const [linkedinLinked, setLinkedinLinked] = useState<boolean | null>(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const linked = user?.identities?.some((id) => id.provider === 'linkedin_oidc') ?? false;
      setLinkedinLinked(linked);
    });
  }, []);

  async function handleConnectLinkedIn() {
    setLinking(true);
    const supabase = getBrowserClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    await supabase.auth.linkIdentity({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${appUrl}/onboarding`,
        scopes: 'openid profile email',
      },
    });
    // Page will redirect — no cleanup needed
  }

  function handleBack() {
    if (!isLocked && currentStep > 1) setStep((currentStep - 1) as Step);
  }

  function handleNext() {
    if (currentStep < 5) setStep((currentStep + 1) as Step);
  }

  // ── LinkedIn not linked → show gate ────────────────────────────────────────
  if (linkedinLinked === false) {
    return (
      <div className="min-h-screen bg-brand-navy flex">

        {/* ── Left panel — branding (desktop only) ──────────────────────────── */}
        <div className="hidden lg:flex lg:w-[46%] xl:w-[50%] flex-col justify-between p-12 relative overflow-hidden">
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='white' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")",
            }}
            aria-hidden
          />
          {/* Blue radial glow */}
          <div
            className="absolute top-0 left-0 w-[600px] h-[400px] bg-brand-blue/15 rounded-full blur-3xl pointer-events-none"
            aria-hidden
          />

          {/* Logo */}
          <div className="relative flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-blue flex items-center justify-center">
              <span className="text-white font-bold text-base leading-none select-none">E</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide">Expertly</span>
          </div>

          {/* Value props */}
          <div className="relative space-y-8">
            <div>
              <p className="text-brand-blue-light text-sm font-semibold tracking-widest uppercase mb-3">
                One step from joining
              </p>
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-snug">
                Every member is<br />
                <span className="text-brand-blue-light">verified. Every time.</span>
              </h2>
              <p className="mt-4 text-white/60 text-base leading-relaxed max-w-sm">
                Expertly enforces LinkedIn verification for all members — regardless of how you signed up.
                It&apos;s how we keep the network trusted and free of unverified profiles.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '500+', label: 'Verified Experts' },
                { value: '40+', label: 'Countries' },
                { value: '1,200+', label: 'Articles' },
                { value: '3,800+', label: 'Consultations' },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                  <p className="text-xl font-bold text-white tabular-nums">{value}</p>
                  <p className="text-xs text-white/50 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-white/30">
            © {new Date().getFullYear()} Expertly. All rights reserved.
          </p>
        </div>

        {/* ── Right panel — connect card ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-brand-surface">

          {/* Back link */}
          <div className="px-6 pt-6 pb-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-navy transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

              {/* Mobile logo */}
              <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
                <div className="w-8 h-8 rounded bg-brand-blue flex items-center justify-center">
                  <span className="text-white font-bold text-sm leading-none select-none">E</span>
                </div>
                <span className="text-brand-navy font-bold text-lg tracking-wide">Expertly</span>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                {/* LinkedIn icon */}
                <div className="w-14 h-14 rounded-2xl bg-[#0077B5]/10 border border-[#0077B5]/20 flex items-center justify-center mb-6">
                  <svg className="h-7 w-7 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-brand-navy mb-2">
                  Connect your LinkedIn
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-1">
                  You signed up with email — great start. However, Expertly requires every member
                  to verify their professional identity through LinkedIn.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  This is a one-time step that keeps the network trusted and verified.
                </p>

                <ul className="space-y-2.5 mb-8">
                  {[
                    'Confirms your real professional identity',
                    'Keeps the network free of unverified profiles',
                    'Auto-fills your profile during the application',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <svg className="h-4 w-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => void handleConnectLinkedIn()}
                  disabled={linking}
                  className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#0077B5] hover:bg-[#006097] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 transition-all shadow-sm"
                >
                  {linking ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Redirecting to LinkedIn…
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      Connect LinkedIn
                    </>
                  )}
                </button>

                <p className="mt-4 text-xs text-center text-gray-400">
                  We never post to LinkedIn without your permission.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // ── Still checking identities → skeleton ────────────────────────────────────
  if (linkedinLinked === null) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* ── Hero band ─────────────────────────────────────── */}
      <div className="bg-brand-navy py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>
          </div>
          {isLocked ? (
            /* ── Submitted: no steps, just status ── */
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-blue/20 border border-brand-blue/40 mb-5">
                <svg className="w-7 h-7 text-brand-blue-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="section-label mb-2">Application Submitted</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Your application is under review
              </h1>
              <p className="mt-3 text-sm sm:text-base text-white/50 max-w-md mx-auto leading-relaxed">
                We&apos;ll notify you via email once our team has reviewed your application. This usually takes 3–5 business days.
              </p>
            </div>
          ) : (
            /* ── In-progress: label + step bar ── */
            <>
              <p className="section-label mb-2 text-center">Membership Application</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
                Apply to Join Expertly
              </h1>
              <div className="mt-8 flex items-center justify-center gap-0">
                {STEPS.map((step, idx) => {
                  const isCompleted = step.number < currentStep;
                  const isCurrent = step.number === currentStep;
                  return (
                    <div key={step.number} className="flex items-center">
                      {idx > 0 && (
                        <div className={`h-0.5 w-8 sm:w-14 transition-colors duration-300 ${isCompleted ? 'bg-brand-blue' : 'bg-white/20'}`} />
                      )}
                      <div className="flex flex-col items-center" onClick={() => isCompleted && setStep(step.number)}>
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                            isCompleted
                              ? 'bg-brand-navy border-brand-blue cursor-pointer hover:bg-brand-blue/20 hover:scale-110'
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
                            <span className={isCurrent ? 'text-white' : 'text-white/40'}>{step.number}</span>
                          )}
                        </div>
                        <span className={`mt-1.5 text-[10px] sm:text-xs font-medium transition-colors duration-200 ${isCurrent ? 'text-white' : isCompleted ? 'text-brand-blue cursor-pointer hover:text-white' : 'text-white/30'}`}>
                          {step.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Form area ──────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {currentStep === 1 && <Step1Identity onNext={handleNext} />}
        {currentStep === 2 && <Step2Experience onBack={handleBack} onNext={handleNext} />}
        {currentStep === 3 && <Step3Services onBack={handleBack} onNext={handleNext} />}
        {currentStep === 4 && <Step4Motivation onBack={handleBack} onNext={handleNext} />}
        {currentStep === 5 && <Step5Review onBack={handleBack} />}
      </div>
    </div>
  );
}
