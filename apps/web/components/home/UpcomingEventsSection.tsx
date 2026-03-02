import Link from 'next/link';

export interface HomepageEvent {
  id: string;
  slug: string;
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isVirtual?: boolean;
  organizer?: {
    user?: {
      firstName?: string;
      lastName?: string;
      fullName?: string;
    };
  };
}

interface UpcomingEventsSectionProps {
  events: HomepageEvent[];
}

function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function EventCard({ event }: { event: HomepageEvent }) {
  const format = event.isVirtual ? 'Online' : 'In-person';

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-6"
    >
      {/* Format badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            event.isVirtual
              ? 'bg-blue-50 text-blue-700 border border-blue-100'
              : 'bg-green-50 text-green-700 border border-green-100'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${event.isVirtual ? 'bg-blue-500' : 'bg-green-500'}`} />
          {format}
        </span>
      </div>

      <h3 className="font-semibold text-brand-navy leading-snug line-clamp-2 text-sm sm:text-base mb-3">
        {event.title}
      </h3>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <svg className="h-3.5 w-3.5 text-brand-blue flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatEventDate(event.startDate)}</span>
      </div>
    </Link>
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
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors border border-brand-blue/30 rounded-lg px-4 py-2 hover:bg-brand-blue-subtle"
          >
            View All
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl bg-brand-surface border border-gray-100 py-12 text-center">
            <p className="text-sm text-brand-text-muted">No upcoming events planned at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {events.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
