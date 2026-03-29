import Link from 'next/link';
import type { MemberCardData } from '@/components/shared/MemberCard';

interface FeaturedMembersSectionProps {
  members: MemberCardData[];
}

function HomeMemberCard({ member }: { member: MemberCardData }) {
  const photoUrl = member.profilePhotoUrl || member.avatarUrl;
  const displayName =
    member.users?.fullName ||
    [member.users?.firstName, member.users?.lastName].filter(Boolean).join(' ') ||
    'Expert';

  const location = [member.city, member.country].filter(Boolean).join(', ');
  const serviceName = member.services?.name || member.services?.categories?.name;

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/members/${member.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 hover:border-brand-gold/40 hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      {/* Portrait photo */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={displayName}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-blue flex items-center justify-center">
            <span className="text-white font-black text-5xl select-none">{initials}</span>
          </div>
        )}

        {/* Bottom gradient for text legibility */}
        <div
          className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
          aria-hidden
        />

        {/* Verified badge — top right */}
        {member.isVerified && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
            <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Verified">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Service tag — bottom left of photo */}
        {serviceName && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center rounded-full bg-brand-gold px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              {serviceName}
            </span>
          </div>
        )}

      </div>

      {/* Info strip */}
      <div className="p-4 flex flex-col gap-1.5">

        {/* Name + arrow */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-brand-navy text-sm sm:text-base leading-snug group-hover:text-brand-blue transition-colors">
              {displayName}
            </h3>
          </div>
          <svg
            className="h-4 w-4 text-gray-200 group-hover:text-brand-gold transition-colors flex-shrink-0 mt-0.5 shrink-0"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Designation */}
        {member.designation && (
          <p className="text-[11px] font-medium text-gray-500 leading-snug line-clamp-1">
            {member.designation}
          </p>
        )}

        {/* Location — city muted, country highlighted */}
        {location && (
          <p className="mt-0.5 text-[11px] flex items-center gap-1">
            <svg className="h-3 w-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {member.city && (
              <span className="text-gray-400">{member.city}{member.country ? ',\u00a0' : ''}</span>
            )}
            {member.country && <span className="font-semibold text-brand-navy">{member.country}</span>}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function FeaturedMembersSection({ members }: FeaturedMembersSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">
              OUR NETWORK
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight">
              Expertly Members
            </h2>
          </div>
          <Link
            href="/members"
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-navy border border-gray-200 rounded-lg px-4 py-2 hover:border-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-200 flex-shrink-0"
          >
            Browse All
            <svg className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {members.length === 0 ? (
          <div className="rounded-2xl bg-brand-surface border border-gray-100 py-16 text-center">
            <p className="text-sm text-brand-text-muted">No featured members found.</p>
          </div>
        ) : (
          <>
            {/* Mobile: horizontal snap-scroll — cards peek at 72vw to signal more */}
            <div className="sm:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-2">
              {members.slice(0, 4).map((member) => (
                <div key={member.id} className="snap-start flex-shrink-0 w-[72vw] max-w-[260px]">
                  <HomeMemberCard member={member} />
                </div>
              ))}
              {/* Trailing spacer so last card doesn't sit flush against edge */}
              <div className="flex-shrink-0 w-4" aria-hidden />
            </div>

            {/* Desktop: 4-column grid */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-5">
              {members.slice(0, 4).map((member) => (
                <HomeMemberCard key={member.id} member={member} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
