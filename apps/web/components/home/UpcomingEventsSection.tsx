import Link from 'next/link';

export interface HomepageEvent {
  id: string;
  slug: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isVirtual?: boolean;
  eventFormat?: string;
  eventType?: string;
  city?: string;
  country?: string;
  registrationUrl?: string;
}

interface UpcomingEventsSectionProps {
  events: HomepageEvent[];
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  workshop: 'WORKSHOP',
  seminar: 'SEMINAR',
  conference: 'CONFERENCE',
  summit: 'SUMMIT',
  webinar: 'WEBINAR',
  networking: 'NETWORKING',
  online: 'ONLINE',
  virtual: 'ONLINE',
  in_person: 'IN PERSON',
  hybrid: 'HYBRID',
};

function HomeEventCard({ event }: { event: HomepageEvent }) {
  const startDate = new Date(event.startDate);
  const day = startDate.toLocaleDateString('en-US', { day: 'numeric' });
  const month = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  const isOnline =
    event.isVirtual ||
    event.eventFormat === 'virtual' ||
    event.eventFormat === 'online';

  const locationStr = isOnline
    ? 'Online'
    : [event.city, event.country].filter(Boolean).join(', ') || event.location;

  const typeKey = event.eventType?.toLowerCase() || event.eventFormat?.toLowerCase() || '';
  const typeLabel = EVENT_TYPE_LABELS[typeKey] || typeKey.toUpperCase() || null;

  const endDate = event.endDate ? new Date(event.endDate) : null;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex items-start gap-5">
      {/* Date badge */}
      <div className="flex-shrink-0 w-16 text-center bg-gray-50 rounded-xl border border-gray-100 py-3 px-2">
        <span className="block text-2xl font-bold text-brand-navy leading-none tabular-nums">
          {day}
        </span>
        <span className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mt-1">
          {month}
        </span>
        {endDate && (
          <>
            <span className="block text-xs text-gray-300 my-1">TO</span>
            <span className="block text-base font-bold text-brand-navy leading-none tabular-nums">
              {endDate.toLocaleDateString('en-US', { day: 'numeric' })}
            </span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mt-1">
              {endDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
            </span>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link href={`/events/${event.slug}`}>
          <h3 className="font-semibold text-brand-navy text-sm sm:text-base leading-snug group-hover:text-brand-blue transition-colors mb-2">
            {event.title}
          </h3>
        </Link>

        {event.description && (
          <p className="text-xs text-brand-text-secondary leading-relaxed line-clamp-2 mb-3">
            {event.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {locationStr && (
            <span className="inline-flex items-center gap-1 text-xs text-brand-text-muted">
              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {locationStr}
            </span>
          )}
          {typeLabel && (
            <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {typeLabel}
            </span>
          )}
        </div>
      </div>

      {/* Register button */}
      <div className="flex-shrink-0 hidden sm:block">
        <Link
          href={event.registrationUrl || `/events/${event.slug}`}
          target={event.registrationUrl ? '_blank' : undefined}
          rel={event.registrationUrl ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-brand-blue text-xs font-bold text-brand-blue hover:bg-brand-blue hover:text-white transition-colors uppercase tracking-wide whitespace-nowrap"
        >
          Register
        </Link>
      </div>
    </div>
  );
}

export default function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-label mb-1">CALENDAR</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors"
          >
            View All
            <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl bg-brand-surface border border-gray-100 py-12 text-center">
            <p className="text-sm text-brand-text-muted">No upcoming events planned at this time.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.slice(0, 3).map((event) => (
              <HomeEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
