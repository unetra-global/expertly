'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export default function GuestNewsletterSection() {
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Auth check ────────────────────────────────────────────────────────────

  useEffect(() => {
    const supabase = getBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      setIsGuest(!data.session);
    });
  }, []);

  // ── Fetch categories ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!isGuest) return;
    void fetch(`${API_BASE}/api/v1/newsletter/categories`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((json: unknown) => {
        const arr = Array.isArray(json)
          ? json
          : (json as { data?: Category[] }).data ?? [];
        setCategories(arr as Category[]);
      })
      .catch(() => { /* non-fatal */ });
  }, [isGuest]);

  // ── Close dropdown on outside click ──────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Toggle category ───────────────────────────────────────────────────────

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedIds.length === 0) {
      setErrorMessage('Please select at least one area of interest.');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch(`${API_BASE}/api/v1/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          categoryIds: selectedIds,
        }),
      });

      if (res.status === 409) {
        setErrorMessage('This email is already subscribed.');
        setStatus('error');
        return;
      }
      if (!res.ok) {
        setErrorMessage('Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  if (isGuest === null || !isGuest) return null;

  // ── Success ───────────────────────────────────────────────────────────────

  if (status === 'success') {
    return (
      <section className="bg-brand-surface py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-card p-8 sm:p-10 max-w-xl mx-auto text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-brand-text mb-2">You're subscribed!</h3>
            <p className="text-sm text-brand-text-muted">
              You'll receive a daily digest of the latest expert articles in your inbox every morning.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ── Dropdown label ────────────────────────────────────────────────────────

  const dropdownLabel =
    selectedIds.length === 0
      ? 'Select areas of interest…'
      : selectedIds.length === 1
        ? (categories.find((c) => c.id === selectedIds[0])?.name ?? '1 selected')
        : `${selectedIds.length} areas selected`;

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <section className="bg-brand-surface py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-card p-8 sm:p-10 max-w-xl mx-auto">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-text">Subscribe to us</h3>
              <p className="text-sm text-brand-text-muted">
                Get a daily digest of expert articles in your inbox.
              </p>
            </div>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="nl-name" className="block text-sm font-medium text-brand-text mb-1">
                Your name
              </label>
              <input
                id="nl-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-brand-text placeholder-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="nl-email" className="block text-sm font-medium text-brand-text mb-1">
                Email address
              </label>
              <input
                id="nl-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-brand-text placeholder-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors"
              />
            </div>

            {/* Areas of interest — click-to-open dropdown with checkboxes */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Areas of interest <span className="text-red-500">*</span>
                </label>

                <div ref={dropdownRef} className="relative">
                  {/* Trigger button */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((o) => !o)}
                    className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/30 ${
                      dropdownOpen
                        ? 'border-brand-blue'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${selectedIds.length > 0 ? 'text-brand-text' : 'text-brand-text-muted'}`}
                  >
                    <span>{dropdownLabel}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-brand-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {dropdownOpen && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                      {categories.map((cat) => {
                        const checked = selectedIds.includes(cat.id);
                        return (
                          <label
                            key={cat.id}
                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-brand-surface transition-colors select-none"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCategory(cat.id)}
                              className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/30 cursor-pointer"
                            />
                            <span className="text-sm text-brand-text">{cat.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subscribing…
                </>
              ) : (
                'Subscribe to Newsletter'
              )}
            </button>

            <p className="text-xs text-brand-text-muted text-center">
              You can unsubscribe at any time. We send one digest per day.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
