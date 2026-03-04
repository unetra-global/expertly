'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/hooks/queryKeys';
import { FilterSheet } from '@/components/ui/FilterSheet';
import type { EventListItem, PaginatedResponse } from '@/types/api';

const COUNTRIES = [
  'Australia', 'Canada', 'Hong Kong', 'India', 'Malaysia', 'Singapore',
  'United Arab Emirates', 'United Kingdom', 'United States',
];

const FORMAT_LABELS: Record<string, string> = {
  online: 'Online',
  in_person: 'In Person',
  hybrid: 'Hybrid',
};

const FORMAT_COLORS: Record<string, string> = {
  online: 'bg-blue-50 border-blue-100 text-blue-700',
  in_person: 'bg-green-50 border-green-100 text-green-700',
  hybrid: 'bg-purple-50 border-purple-100 text-purple-700',
};

// ── Mini Calendar ─────────────────────────────────────────────────────────────

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function MiniCalendar({ selectedDate, onSelect }: { selectedDate: string; onSelect: (date: string) => void }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function toDateStr(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Previous month">
          <svg className="h-4 w-4 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xs font-semibold text-brand-navy">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Next month">
          <svg className="h-4 w-4 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-xs text-brand-text-muted font-medium py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = toDateStr(day);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          return (
            <button
              key={day}
              onClick={() => onSelect(isSelected ? '' : dateStr)}
              className={`text-xs py-1 rounded-md font-medium transition-colors ${
                isSelected ? 'bg-brand-blue text-white'
                : isToday ? 'bg-brand-blue-subtle text-brand-blue border border-brand-blue/30'
                : 'text-brand-text hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Event Card ────────────────────────────────────────────────────────────────

function EventCard({ event }: { event: EventListItem }) {
  const startDate = new Date(event.startDate);
  const day = startDate.toLocaleDateString('en-GB', { day: '2-digit' });
  const month = startDate.toLocaleDateString('en-GB', { month: 'short' });
  const time = startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  const format = event.format ?? 'online';
  const formatLabel = FORMAT_LABELS[format] ?? format;
  const formatColor = FORMAT_COLORS[format] ?? 'bg-gray-50 border-gray-100 text-gray-600';
  const location = event.format === 'online' ? 'Online' : [event.city, event.country].filter(Boolean).join(', ');

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex"
    >
      <div className="bg-brand-blue w-16 sm:w-20 flex-shrink-0 flex flex-col items-center justify-center py-5 px-2">
        <span className="text-2xl sm:text-3xl font-bold text-white leading-none tabular-nums">{day}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-100 mt-1">{month}</span>
      </div>
      <div className="flex-1 min-w-0 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-brand-navy text-sm sm:text-base leading-snug group-hover:text-brand-blue transition-colors line-clamp-2">
            {event.title}
          </h3>
          <span className={`flex-shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${formatColor}`}>
            {formatLabel}
          </span>
        </div>
        {event.shortDescription && (
          <p className="text-xs text-brand-text-secondary leading-relaxed line-clamp-2 mb-2">
            {event.shortDescription}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-brand-text-muted">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {time} UTC
          </span>
          {location && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface EventsClientProps {
  initialFilters: Record<string, string>;
}

export default function EventsClient({ initialFilters }: EventsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialFilters.q ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.q ?? '');
  const [country, setCountry] = useState(initialFilters.country ?? '');
  const [format, setFormat] = useState(initialFilters.format ?? '');
  const [selectedDate, setSelectedDate] = useState(initialFilters.date ?? '');
  const [sort, setSort] = useState(initialFilters.sort ?? 'date_asc');
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const syncUrl = useCallback((q: string, c: string, f: string, d: string, so: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (c) params.set('country', c);
    if (f) params.set('format', f);
    if (d) params.set('date', d);
    if (so && so !== 'date_asc') params.set('sort', so);
    router.push(`/events${params.size ? `?${params.toString()}` : ''}`, { scroll: false });
  }, [router]);

  useEffect(() => {
    syncUrl(debouncedSearch, country, format, selectedDate, sort);
  }, [debouncedSearch, country, format, selectedDate, sort, syncUrl]);

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '');
    setCountry(searchParams.get('country') ?? '');
    setFormat(searchParams.get('format') ?? '');
    setSelectedDate(searchParams.get('date') ?? '');
    setSort(searchParams.get('sort') ?? 'date_asc');
    setPage(1);
  }, [searchParams]);

  const activeFilters: Record<string, string> = {
    upcoming: 'true',
    limit: '20',
    page: String(page),
    ...(debouncedSearch && { q: debouncedSearch }),
    ...(country && { country }),
    ...(format && { format }),
    ...(selectedDate && { date: selectedDate }),
    ...(sort && { sort }),
  };

  const { data, isLoading, isError } = useQuery<PaginatedResponse<EventListItem>>({
    queryKey: queryKeys.events.list(activeFilters),
    queryFn: () => {
      const qs = new URLSearchParams(activeFilters).toString();
      return apiClient.get<PaginatedResponse<EventListItem>>(`/events?${qs}`);
    },
    placeholderData: (prev) => prev,
  });

  const events = data?.data ?? [];
  const meta = data?.meta;
  const totalResults = meta?.total ?? events.length;
  const hasFilters = !!(debouncedSearch || country || format || selectedDate);
  const activeFilterCount = [country, format, selectedDate].filter(Boolean).length;

  function clearFilters() {
    setSearch('');
    setDebouncedSearch('');
    setCountry('');
    setFormat('');
    setSelectedDate('');
    setSort('date_asc');
    setPage(1);
  }

  const filterControls = (
    <>
      {/* COUNTRY */}
      <div>
        <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">Country</label>
        <select
          value={country}
          onChange={(e) => { setCountry(e.target.value); setPage(1); }}
          className="w-full px-3 py-2.5 text-sm text-brand-text bg-brand-surface border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none cursor-pointer"
        >
          <option value="">All Countries</option>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* FORMAT */}
      <div>
        <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">Event Type</label>
        <select
          value={format}
          onChange={(e) => { setFormat(e.target.value); setPage(1); }}
          className="w-full px-3 py-2.5 text-sm text-brand-text bg-brand-surface border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="online">Online</option>
          <option value="in_person">In Person</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      {/* EVENT DATE — mini calendar */}
      <div>
        <p className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-3">Event Date</p>
        {selectedDate && (
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs text-brand-blue font-medium">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <button onClick={() => setSelectedDate('')} className="text-xs text-brand-text-muted hover:text-red-500 transition-colors">✕</button>
          </div>
        )}
        <MiniCalendar selectedDate={selectedDate} onSelect={(d) => { setSelectedDate(d); setPage(1); }} />
      </div>

      {/* Host an Event CTA */}
      <div className="rounded-xl bg-brand-blue p-4 text-center">
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">Host an Event</p>
        <p className="text-xs text-blue-100 leading-relaxed mb-3">
          Organise a webinar, conference, or workshop for the Expertly community.
        </p>
        <Link
          href="/auth?tab=signup"
          className="inline-flex items-center justify-center w-full text-xs font-semibold text-brand-blue bg-white hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Page header */}
      <div className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <p className="section-label mb-2">What&apos;s On</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Discover Global Professional Events</h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base max-w-xl">
            Conferences, webinars, and networking events for finance and legal professionals.
          </p>

          {/* Top search bar — mobile: search only; desktop: search + country + type */}
          <div className="mt-5 bg-white rounded-2xl shadow-lg p-2 flex gap-2 max-w-3xl">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events…"
                className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-800 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            {/* Desktop-only dropdowns */}
            <div className="hidden sm:flex items-center gap-0">
              <div className="w-px bg-gray-200 self-stretch my-1 mx-2" />
              <select
                value={country}
                onChange={(e) => { setCountry(e.target.value); setPage(1); }}
                className="pl-4 pr-8 py-2.5 text-sm text-gray-800 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none cursor-pointer w-36"
              >
                <option value="">All Countries</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="w-px bg-gray-200 self-stretch my-1 mx-2" />
              <select
                value={format}
                onChange={(e) => { setFormat(e.target.value); setPage(1); }}
                className="pl-4 pr-8 py-2.5 text-sm text-gray-800 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none cursor-pointer w-36"
              >
                <option value="">All Types</option>
                <option value="online">Online</option>
                <option value="in_person">In Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <button
              onClick={() => syncUrl(search, country, format, selectedDate, sort)}
              className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">SEARCH</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar — desktop only ────────────────────── */}
          <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 lg:sticky lg:top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider">Filters</h2>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs font-medium text-brand-blue hover:text-brand-blue-dark transition-colors">
                    Clear all
                  </button>
                )}
              </div>
              {filterControls}
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5 lg:mb-6">
              <p className="text-sm text-brand-text-secondary">
                {isLoading ? (
                  <span className="inline-block w-24 h-4 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <>
                    <span className="font-semibold text-brand-navy">{totalResults.toLocaleString()}</span>
                    {' '}upcoming event{totalResults !== 1 ? 's' : ''}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSheetOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-brand-text hover:bg-brand-surface transition-colors"
                >
                  <svg className="h-4 w-4 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-blue text-white text-xs font-bold leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="text-sm text-brand-text border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none cursor-pointer"
                >
                  <option value="date_asc">Soonest</option>
                  <option value="date_desc">Latest</option>
                </select>
              </div>
            </div>

            {isError && (
              <div className="rounded-2xl bg-red-50 border border-red-100 p-8 text-center">
                <p className="text-sm text-red-700">Failed to load events. Please try again.</p>
              </div>
            )}

            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex animate-pulse">
                    <div className="w-16 sm:w-20 bg-gray-100 flex-shrink-0 h-24" />
                    <div className="flex-1 p-5 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-1/2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !isError && (
              <>
                {events.length === 0 ? (
                  <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-brand-surface flex items-center justify-center mx-auto mb-4">
                      <svg className="h-7 w-7 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-brand-navy mb-1">No upcoming events</h3>
                    <p className="text-sm text-brand-text-muted mb-4">
                      {hasFilters ? 'No events match your filters.' : 'Check back soon — new events are added regularly.'}
                    </p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-sm font-medium text-brand-blue hover:underline">
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {events.map((event) => <EventCard key={event.id} event={event} />)}
                  </div>
                )}

                {meta && meta.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-brand-text hover:bg-brand-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm text-brand-text-secondary">{page} / {meta.totalPages}</span>
                    <button
                      onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                      disabled={page >= meta.totalPages}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-brand-text hover:bg-brand-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <FilterSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onClear={clearFilters}
        hasFilters={hasFilters}
      >
        {filterControls}
      </FilterSheet>
    </>
  );
}
