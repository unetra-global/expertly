'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PROFESSIONS = [
  'Corporate Law',
  'Tax & Accounting',
  'Investment Banking',
  'Compliance & Regulatory',
  'Mergers & Acquisitions',
  'Forensic Accounting',
  'Intellectual Property',
  'Financial Advisory',
];

const COUNTRIES = [
  'Singapore',
  'United Kingdom',
  'United Arab Emirates',
  'United States',
  'Australia',
  'India',
  'Hong Kong',
  'Malaysia',
];

export default function HeroSection() {
  const router = useRouter();
  const [profession, setProfession] = useState('');
  const [country, setCountry] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (profession) params.set('service', profession);
    if (country) params.set('country', country);
    router.push(`/members${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <section className="relative bg-brand-navy overflow-hidden">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='white' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />
      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        {/* Tag chip */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
          <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">
            Global Network
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.12] tracking-tight max-w-3xl mx-auto">
          The World&apos;s Premier{' '}
          <span className="text-brand-blue-light">Financial &amp; Legal Experts</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
          Connect with verified professionals. Read expert insights.
          Discover events that advance your career.
        </p>

        {/* ── Search bar ──────────────────────────────────── */}
        <form
          onSubmit={handleSearch}
          className="mt-10 max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2"
        >
          {/* Profession select */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full pl-9 pr-4 py-3 text-sm text-brand-text bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none cursor-pointer"
            >
              <option value="">Select Services</option>
              {PROFESSIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-gray-200 self-stretch my-1" />

          {/* Country select */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full pl-9 pr-4 py-3 text-sm text-brand-text bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none cursor-pointer"
            >
              <option value="">Select Country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* CTA button */}
          <button
            type="submit"
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            FIND AN EXPERT
          </button>
        </form>

        {/* Trust signal */}
        <p className="mt-5 text-xs text-white/40">
          All members vetted &amp; verified · Finance and legal specialists · Global network
        </p>
      </div>
    </section>
  );
}
