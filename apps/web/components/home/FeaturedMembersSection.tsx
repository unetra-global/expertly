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

        {/* Service tag — overlaid at bottom left */}
        {serviceName && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-brand-navy shadow-sm">
              {serviceName}
            </span>
          </div>
        )}
      </div>

      {/* Info strip */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-brand-navy text-sm sm:text-base leading-snug group-hover:text-brand-blue transition-colors truncate">
              {displayName}
            </h3>
            {member.designation && (
              <p className="mt-0.5 text-xs text-gray-500 line-clamp-1 leading-snug">
                {member.designation}
              </p>
            )}
          </div>
          <svg
            className="h-4 w-4 text-gray-200 group-hover:text-brand-gold transition-colors flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {location && (
          <p className="mt-2 text-[11px] text-gray-400 flex items-center gap-1">
            <svg className="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
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
              Featured Members
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {members.slice(0, 4).map((member) => (
              <HomeMemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
