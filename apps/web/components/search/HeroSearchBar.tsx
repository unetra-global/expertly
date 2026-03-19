'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface HeroSearchBarProps {
  placeholders: string[];
  scope?: 'members' | 'articles' | 'events';
  className?: string;
}

const TYPING_SPEED = 55;
const ERASE_SPEED = 30;
const PAUSE_AFTER_TYPE = 2200;
const PAUSE_AFTER_ERASE = 400;

export function HeroSearchBar({ placeholders, scope, className = '' }: HeroSearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter effect — only runs when input is empty and not focused
  useEffect(() => {
    let cancelled = false;
    let phraseIndex = 0;
    let charIndex = 0;
    let erasing = false;
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      if (cancelled) return;

      const phrase = placeholders[phraseIndex % placeholders.length] ?? '';

      if (!erasing) {
        // Typing
        charIndex++;
        setPlaceholder(phrase.slice(0, charIndex));

        if (charIndex >= phrase.length) {
          erasing = true;
          timeout = setTimeout(tick, PAUSE_AFTER_TYPE);
        } else {
          timeout = setTimeout(tick, TYPING_SPEED);
        }
      } else {
        // Erasing
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
  }, [placeholders]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputValue.trim();
    if (q.length >= 2) {
      const url = scope
        ? `/search?q=${encodeURIComponent(q)}&scope=${scope}`
        : `/search?q=${encodeURIComponent(q)}`;
      router.push(url);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`mt-6 w-full ${className}`}>
      <div
        className={`relative flex items-center bg-white rounded-2xl shadow-xl transition-shadow duration-200 ${
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
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? '' : placeholder}
          autoComplete="off"
          aria-label="AI-powered search"
          className="flex-1 pl-14 pr-4 py-4 text-sm sm:text-base text-gray-800 bg-transparent placeholder-gray-400 focus:outline-none"
        />

        {/* AI badge — visible on sm+ */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 mr-2 rounded-lg bg-brand-surface border border-gray-100 flex-shrink-0">
          <svg className="h-3.5 w-3.5 text-brand-blue flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs font-semibold text-brand-text-muted tracking-wide">AI</span>
        </div>

        <div className="flex-shrink-0 pr-2 py-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-dark active:scale-95 text-white text-sm font-semibold transition-all duration-150"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-white/40 flex items-center gap-1.5">
        <svg className="h-3 w-3 inline-block text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        AI-powered &mdash; try natural language like &ldquo;M&amp;A advisor in Singapore with 10+ years&rdquo;
      </p>
    </form>
  );
}
