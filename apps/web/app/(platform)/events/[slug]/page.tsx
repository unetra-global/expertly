import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { EventFull } from '@/types/api';

export const revalidate = 300;

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002') + '/api/v1';

async function fetchEvent(slug: string): Promise<EventFull | null> {
  try {
    const res = await fetch(`${API_BASE}/events/${slug}`, {
      next: { revalidate: 300 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data?: EventFull };
    return json.data ?? null;
  } catch {
    return null;
  }
}

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await fetchEvent(params.slug);
  if (!event) return { title: 'Event Not Found | Expertly' };
  return {
    title: `${event.title} | Expertly Events`,
    description: event.description?.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 160),
      images: event.coverImageUrl ? [{ url: event.coverImageUrl }] : [],
    },
  };
}

const FORMAT_LABELS: Record<string, string> = {
  online: 'Online',
  virtual: 'Online',
  in_person: 'In Person',
  hybrid: 'Hybrid',
};

const FORMAT_COLORS: Record<string, string> = {
  online: 'bg-blue-50 border-blue-100 text-blue-700',
  virtual: 'bg-blue-50 border-blue-100 text-blue-700',
  in_person: 'bg-green-50 border-green-100 text-green-700',
  hybrid: 'bg-purple-50 border-purple-100 text-purple-700',
};

export default async function EventSlugPage({ params }: PageProps) {
  const event = await fetchEvent(params.slug);
  if (!event) notFound();

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(startDate);

  const timeLabel = startDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC';

  const endTimeLabel = endDate
    ? endDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }) + ' UTC'
    : null;

  const format = event.eventFormat ?? 'online';
  const formatLabel = FORMAT_LABELS[format] ?? format;
  const formatColor = FORMAT_COLORS[format] ?? 'bg-gray-50 border-gray-100 text-gray-600';

  const location =
    (format === 'online' || format === 'virtual')
      ? 'Online Event'
      : [event.venueName, event.city, event.country].filter(Boolean).join(', ');

  return (
    <>
      {/* Cover image */}
      {event.coverImageUrl && (
        <div className="w-full h-56 sm:h-72 overflow-hidden bg-brand-navy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover opacity-80" />
        </div>
      )}

      {/* Hero band */}
      <div className="bg-brand-navy">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/40 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/events" className="hover:text-white/70 transition-colors">Events</Link>
            <span>/</span>
            <span className="text-white/60 truncate max-w-[200px]">{event.title}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${formatColor}`}>
                  {formatLabel}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                {event.title}
              </h1>
              {event.description && (
                <p className="text-white/60 text-base">{event.description}</p>
              )}
            </div>

            {event.registrationUrl && (
              <div className="flex-shrink-0">
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 btn-primary-dark px-6 py-3 text-base"
                >
                  Register Now
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {event.description && (
              <section className="mb-8">
                <h2 className="text-lg font-bold text-brand-navy pb-3 border-b border-gray-100 mb-5">
                  About this Event
                </h2>
                <div className="prose prose-sm max-w-none prose-p:text-brand-text-secondary prose-headings:text-brand-navy prose-a:text-brand-blue">
                  <p className="text-brand-text-secondary leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </section>
            )}

            {/* Speakers */}
            {(event.speakers ?? []).length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-brand-navy pb-3 border-b border-gray-100 mb-5">
                  Speakers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(event.speakers ?? []).map((speaker) => (
                    <div key={speaker.id} className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex items-start gap-3">
                      {speaker.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={speaker.photoUrl}
                          alt={speaker.name}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-brand-navy flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
                          {speaker.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-brand-navy text-sm">{speaker.name}</p>
                        {speaker.title && <p className="text-xs text-brand-text-secondary">{speaker.title}</p>}
                        {speaker.organization && <p className="text-xs text-brand-text-muted">{speaker.organization}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Event details card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-4">
                <h3 className="text-sm font-bold text-brand-navy">Event Details</h3>

                {/* Date */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-surface flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-brand-text-muted">Date</p>
                    <p className="text-sm font-semibold text-brand-navy">{dateLabel}</p>
                    <p className="text-xs text-brand-text-muted">
                      {timeLabel}{endTimeLabel ? ` – ${endTimeLabel}` : ''}
                    </p>
                  </div>
                </div>

                {/* Format / Location */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-surface flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-brand-text-muted">Location</p>
                    <p className="text-sm font-semibold text-brand-navy">{formatLabel}</p>
                    {location && <p className="text-xs text-brand-text-muted">{location}</p>}
                  </div>
                </div>

                {/* Registration CTA */}
                {event.registrationUrl && (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full btn-primary text-center mt-2"
                  >
                    Register Now
                  </a>
                )}
              </div>

              {/* Back to events */}
              <Link
                href="/events"
                className="flex items-center gap-2 text-sm font-medium text-brand-text-secondary hover:text-brand-navy transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to all events
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
