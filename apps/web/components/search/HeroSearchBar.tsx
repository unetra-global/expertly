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
    <form onSubmit={handleSubmit} className={`mt-6 max-w-2xl ${className}`}>
      <div className="relative flex items-center bg-white rounded-2xl shadow-lg overflow-hidden">
        <svg
          className="absolute left-4 h-5 w-5 text-gray-400 pointer-events-none flex-shrink-0"
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
          className="flex-1 pl-12 pr-4 py-3.5 text-sm text-gray-800 bg-transparent placeholder-gray-400 focus:outline-none"
        />

        <div className="flex-shrink-0 pr-1.5 py-1.5">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-white/40">
        AI-powered · Try natural language like &ldquo;events in London this April&rdquo;
      </p>
    </form>
  );
}
