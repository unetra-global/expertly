import type { Metadata } from 'next';
import Link from 'next/link';
import type { EventListItem } from '@/types/api';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Events | Expertly',
  description:
    'Discover upcoming finance and legal events. Conferences, webinars, and networking opportunities for professionals.',
};

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1';

async function fetchEvents(): Promise<EventListItem[]> {
  try {
    const res = await fetch(
      `${API}/events?upcoming=true&limit=24&page=1`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as {
      success: boolean;
      data?: { data: EventListItem[] } | EventListItem[];
    };
    // Handle both paginated and non-paginated responses
    if (!json.data) return [];
    if (Array.isArray(json.data)) return json.data;
    if ('data' in json.data) return json.data.data;
    return [];
  } catch {
    return [];
  }
}

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

function EventCard({ event }: { event: EventListItem }) {
  const startDate = new Date(event.startDate);
  const day = startDate.toLocaleDateString('en-GB', { day: '2-digit' });
  const month = startDate.toLocaleDateString('en-GB', { month: 'short' });
  const time = startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

  const format = event.format ?? 'online';
  const formatLabel = FORMAT_LABELS[format] ?? format;
  const formatColor = FORMAT_COLORS[format] ?? 'bg-gray-50 border-gray-100 text-gray-600';
  const location = event.format === 'online'
    ? 'Online'
    : [event.city, event.country].filter(Boolean).join(', ');

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex"
    >
      {/* Date column */}
      <div className="bg-brand-blue w-20 flex-shrink-0 flex flex-col items-center justify-center py-5 px-2">
        <span className="text-3xl font-bold text-white leading-none tabular-nums">{day}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-100 mt-1">{month}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-brand-navy text-base leading-snug group-hover:text-brand-blue transition-colors line-clamp-2">
            {event.title}
          </h3>
          <span className={`flex-shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${formatColor}`}>
            {formatLabel}
          </span>
        </div>

        {event.shortDescription && (
          <p className="text-xs text-brand-text-secondary leading-relaxed line-clamp-2 mb-3">
            {event.shortDescription}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-brand-text-muted">
          {/* Time */}
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {time} UTC
          </span>
          {/* Location */}
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

export default async function EventsPage() {
  const events = await fetchEvents();

  return (
    <>
      {/* Page header */}
      <div className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="section-label mb-2">What&apos;s On</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Upcoming Events</h1>
          <p className="mt-3 text-white/60 text-base max-w-xl">
            Conferences, webinars, and networking events for finance and legal professionals.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {events.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-surface flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-brand-navy mb-1">No upcoming events</h3>
            <p className="text-sm text-brand-text-muted">Check back soon — new events are added regularly.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-brand-text-secondary mb-6">
              <span className="font-semibold text-brand-navy">{events.length}</span>
              {' '}upcoming event{events.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
