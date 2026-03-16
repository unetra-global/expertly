'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import type { AiSearchResponse } from '@/types/api';
import { SearchDropdown } from './SearchDropdown';

interface GlobalSearchBarProps {
  className?: string;
  onClose?: () => void;
  autoFocus?: boolean;
}

export function GlobalSearchBar({ className = '', onClose, autoFocus }: GlobalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AiSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Auto-focus when requested
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiClient.search.ai(q.trim());
      setResults(data);
      setIsOpen(true);
    } catch {
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(val);
    }, 300);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setIsOpen(false);
      onClose?.();
    }
    if (e.key === 'Enter' && query.trim().length >= 2) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose?.();
    }
  }

  function handleClose() {
    setIsOpen(false);
    onClose?.();
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        {/* Search icon */}
        <svg
          className="absolute left-3 w-4 h-4 text-brand-text-muted pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results) setIsOpen(true); }}
          placeholder="Search members, articles, events..."
          aria-label="AI search"
          autoComplete="off"
          className="w-full pl-9 pr-4 py-2 text-sm bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/40 focus:bg-white/15 transition-all"
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-3 w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-label="Searching..." />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results && (
        <SearchDropdown results={results} query={query} onClose={handleClose} />
      )}
    </div>
  );
}
