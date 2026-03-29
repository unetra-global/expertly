'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const PLACEHOLDERS = [
  'M&A advisor in Singapore with 10+ years...',
  'Tax specialist in London for hedge funds...',
  'IP lawyer with biotech experience...',
  'Compliance expert in UAE financial sector...',
  'Corporate attorney with IPO experience...',
  'Investment banker focused on emerging markets...',
];

const BUTTON_LABELS = ['Find Members', 'Find Events', 'Find Articles'];

const TYPING_SPEED = 55;
const ERASE_SPEED = 30;
const PAUSE_AFTER_TYPE = 2200;
const PAUSE_AFTER_ERASE = 400;
const BUTTON_CYCLE_MS = 2500;

export default function HeroSection() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [buttonIndex, setButtonIndex] = useState(0);
  const [buttonVisible, setButtonVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter effect on placeholder
  useEffect(() => {
    let cancelled = false;
    let phraseIndex = 0;
    let charIndex = 0;
    let erasing = false;
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      if (cancelled) return;
      const phrase = PLACEHOLDERS[phraseIndex % PLACEHOLDERS.length] ?? '';

      if (!erasing) {
        charIndex++;
        setPlaceholder(phrase.slice(0, charIndex));
        if (charIndex >= phrase.length) {
          erasing = true;
          timeout = setTimeout(tick, PAUSE_AFTER_TYPE);
        } else {
          timeout = setTimeout(tick, TYPING_SPEED);
        }
      } else {
        charIndex--;
        setPlaceholder(phrase.slice(0, charIndex));
        if (charIndex <= 0) {
          erasing = false;
          phraseIndex++;
          timeout = setTimeout(tick, PAUSE_AFTER_ERASE);
        } else {
          timeout = setTimeout(tick, ERASE_SPEED);
        }
      }
    }

    timeout = setTimeout(tick, 600);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  // Animate button label cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setButtonVisible(false);
      setTimeout(() => {
        setButtonIndex((i) => (i + 1) % BUTTON_LABELS.length);
        setButtonVisible(true);
      }, 200);
    }, BUTTON_CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputValue.trim();
    if (q.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <section
      className="relative overflow-hidden bg-brand-navy"
      style={{
        backgroundImage: [
          'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(37,99,235,0.07) 0%, transparent 60%)',
          'radial-gradient(ellipse 40% 30% at 80% 80%, rgba(245,158,11,0.04) 0%, transparent 55%)',
        ].join(', '),
      }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1' cy='1' r='1' fill='white'/%3E%3C/svg%3E\")",
          backgroundSize: '24px 24px',
        }}
        aria-hidden
      />
      {/* Top glowing beam */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(99,160,255,0.5) 35%, rgba(201,168,76,0.4) 65%, transparent 100%)',
        }}
        aria-hidden
      />

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
          <span className="text-brand-blue-light">Finance &amp; Legal Experts</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
          Connect with verified professionals. Read expert articles.
          Discover events that advance your career.
        </p>

        {/* ── AI Search bar ─────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="mt-10 max-w-3xl mx-auto">
          <div
            className={`relative flex items-center bg-white rounded-2xl shadow-2xl transition-shadow duration-200 ${
              isFocused ? 'ring-2 ring-brand-blue ring-offset-2 ring-offset-transparent shadow-2xl' : ''
            }`}
          >
            {/* Search icon */}
            <svg
              className="absolute left-5 h-5 w-5 text-gray-400 pointer-events-none flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <input
              ref={inputRef}
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isFocused ? '' : placeholder}
              autoComplete="off"
              aria-label="AI-powered search"
              className="flex-1 min-w-0 pl-14 pr-2 py-4 text-base sm:text-lg text-gray-800 bg-transparent placeholder-gray-400 focus:outline-none"
            />

            {/* AI badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 mr-2 rounded-lg bg-brand-surface border border-gray-100 flex-shrink-0">
              <svg className="h-3.5 w-3.5 text-brand-blue flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-semibold text-brand-text-muted tracking-wide">AI</span>
            </div>

            {/* Animated CTA button */}
            <div className="flex-shrink-0 pr-2 py-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 w-28 sm:w-36 px-3 sm:px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-dark active:scale-95 text-white text-sm font-semibold transition-all duration-150 overflow-hidden"
              >
                <span
                  className={`transition-all duration-200 ${
                    buttonVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                  }`}
                >
                  {BUTTON_LABELS[buttonIndex]}
                </span>
              </button>
            </div>
          </div>

          <p className="mt-2.5 text-xs text-white/40 flex items-center justify-center gap-1.5">
            <svg className="h-3 w-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-powered &mdash; searches members, articles &amp; events
          </p>
        </form>

        {/* Trust signal */}
        <p className="mt-5 text-xs text-white/40">
          All members vetted &amp; verified · Finance and legal specialists · Global network
        </p>
      </div>
    </section>
  );
}
