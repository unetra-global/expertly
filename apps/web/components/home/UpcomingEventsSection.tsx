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
  workshop: 'Workshop',
  seminar: 'Seminar',
  conference: 'Conference',
  summit: 'Summit',
  webinar: 'Webinar',
  networking: 'Networking',
  online: 'Online',
  virtual: 'Online',
  in_person: 'In Person',
  hybrid: 'Hybrid',
};

/** Colored pill styles — on white background */
const EVENT_TYPE_COLORS: Record<string, string> = {
  conference: 'bg-purple-50 text-purple-700 border border-purple-100',
  summit: 'bg-purple-50 text-purple-700 border border-purple-100',
  webinar: 'bg-blue-50 text-blue-700 border border-blue-100',
  online: 'bg-blue-50 text-blue-700 border border-blue-100',
  virtual: 'bg-blue-50 text-blue-700 border border-blue-100',
  workshop: 'bg-amber-50 text-amber-700 border border-amber-100',
  seminar: 'bg-amber-50 text-amber-700 border border-amber-100',
  networking: 'bg-green-50 text-green-700 border border-green-100',
  in_person: 'bg-green-50 text-green-700 border border-green-100',
  hybrid: 'bg-rose-50 text-rose-700 border border-rose-100',
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function HomeEventCard({ event }: { event: HomepageEvent }) {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const singleDay = !endDate || isSameDay(startDate, endDate);

  const startDay = startDate.toLocaleDateString('en-US', { day: 'numeric' });
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  const isOnline =
    event.isVirtual ||
    event.eventFormat === 'virtual' ||
    event.eventFormat === 'online';

  const locationStr = isOnline
    ? 'Online'
    : [event.city, event.country].filter(Boolean).join(', ') || event.location;

  const typeKey = event.eventType?.toLowerCase() || event.eventFormat?.toLowerCase() || '';
  const typeLabel = EVENT_TYPE_LABELS[typeKey] ?? null;
  const typeColor = EVENT_TYPE_COLORS[typeKey] ?? 'bg-gray-50 text-gray-600 border border-gray-100';

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-brand-gold/40 hover:shadow-card-hover transition-all duration-200 overflow-hidden flex">
      {/* Date block — navy accent, fills full card height */}
      {singleDay ? (
        <div className="flex-shrink-0 w-20 sm:w-24 bg-brand-navy flex flex-col items-center justify-center py-6 px-2 self-stretch">
          <span className="text-3xl sm:text-4xl font-black text-white leading-none tabular-nums">
            {startDay}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mt-1.5">
            {startMonth}
          </span>
        </div>
      ) : (
        <div className="flex-shrink-0 bg-brand-navy flex flex-col items-center justify-center py-6 px-3 self-stretch gap-1">
          <div className="flex items-center gap-2">
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-white leading-none tabular-nums">
                {startDay}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-gold mt-1">
                {startMonth}
              </span>
            </div>
            <svg className="h-3 w-3 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-white leading-none tabular-nums">
                {endDate!.toLocaleDateString('en-US', { day: 'numeric' })}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-gold mt-1">
                {endDate!.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 p-5 sm:p-6 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/events/${event.slug}`}>
            <h3 className="font-bold text-brand-navy text-base sm:text-lg leading-snug group-hover:text-brand-blue transition-colors line-clamp-2 mb-2">
              {event.title}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {locationStr && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-text-muted">
                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {locationStr}
              </span>
            )}
            {typeLabel && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${typeColor}`}>
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
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-brand-navy hover:border-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-150 uppercase tracking-wide whitespace-nowrap"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  return (
    <section className="py-20 bg-brand-surface-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">
              CALENDAR
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight">
              Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-navy border border-gray-200 rounded-lg px-4 py-2 hover:border-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-200 flex-shrink-0"
          >
            View All
            <svg className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 py-16 text-center">
            <p className="text-sm text-brand-text-muted">No upcoming events planned at this time.</p>
          </div>
        ) : (
          <>
            {/* Mobile: horizontal snap-scroll */}
            <div className="sm:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-2">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="snap-start flex-shrink-0 w-[85vw] max-w-[360px]">
                  <HomeEventCard event={event} />
                </div>
              ))}
              <div className="flex-shrink-0 w-4" aria-hidden />
            </div>

            {/* Desktop: stacked list */}
            <div className="hidden sm:flex sm:flex-col gap-3">
              {events.slice(0, 3).map((event) => (
                <HomeEventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
