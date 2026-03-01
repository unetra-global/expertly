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
  const organiserName =
    event.organizer?.user?.fullName ||
    [event.organizer?.user?.firstName, event.organizer?.user?.lastName]
      .filter(Boolean)
      .join(' ') ||
    null;

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
          <span
            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              event.isVirtual ? 'bg-blue-500' : 'bg-green-500'
            }`}
          />
          {format}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-brand-navy leading-snug line-clamp-2 group-hover:text-brand-navy text-sm sm:text-base">
        {event.title}
      </h3>

      {/* Meta */}
      <div className="mt-4 space-y-2">
        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg
            className="h-3.5 w-3.5 text-brand-blue flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formatEventDate(event.startDate)}</span>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg
              className="h-3.5 w-3.5 text-brand-blue flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* Organiser */}
        {organiserName && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg
              className="h-3.5 w-3.5 text-brand-blue flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="truncate">By {organiserName}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function UpcomingEventsSection({
  events,
}: UpcomingEventsSectionProps) {
  if (events.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue mb-2">
              What&apos;s Coming
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy">
              Upcoming Events
            </h2>
            <p className="mt-2 text-gray-500 text-sm sm:text-base">
              Industry events, webinars, and networking opportunities.
            </p>
          </div>
          <Link
            href="/events"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-navy hover:text-brand-blue transition-colors"
          >
            View all
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {/* Grid: 1 col → 2 cols → 4 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {events.slice(0, 4).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 sm:hidden text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy hover:text-brand-blue transition-colors"
          >
            View all events →
          </Link>
        </div>
      </div>
    </section>
  );
}
