import Link from 'next/link';
import type { MemberCardData } from '@/components/shared/MemberCard';

interface FeaturedMembersSectionProps {
  members: MemberCardData[];
}

function HomeMemberCard({ member }: { member: MemberCardData }) {
  const displayName =
    member.users?.fullName ||
    [member.users?.firstName, member.users?.lastName].filter(Boolean).join(' ') ||
    'Expert';

  const location = [member.city, member.country].filter(Boolean).join(', ');
  const serviceName = member.services?.name || member.services?.category?.name;

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Photo */}
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        {member.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.profilePhotoUrl}
            alt={displayName}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-brand-navy flex items-center justify-center">
            <span className="text-white font-bold text-4xl">{initials}</span>
          </div>
        )}
        {/* Verified badge */}
        {member.isVerified && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow-sm">
            <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-brand-navy text-sm leading-snug mb-1">
          {displayName}
        </h3>

        {serviceName && (
          <p className="text-xs font-medium text-brand-blue mb-1 leading-snug">
            {serviceName}
          </p>
        )}

        {location && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mb-4">
            <svg className="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </p>
        )}

        <Link
          href={`/members/${member.slug}`}
          className="mt-auto block w-full text-center text-xs font-semibold text-brand-navy border border-gray-200 hover:border-brand-navy hover:bg-brand-navy hover:text-white rounded-lg py-2 transition-all duration-200 uppercase tracking-wide"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

export default function FeaturedMembersSection({
  members,
}: FeaturedMembersSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-label mb-1">OUR NETWORK</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              Featured Members
            </h2>
          </div>
          <Link
            href="/members"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors"
          >
            View All
            <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {members.length === 0 ? (
          <div className="rounded-2xl bg-brand-surface border border-gray-100 py-12 text-center">
            <p className="text-sm text-brand-text-muted">No featured members found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {members.slice(0, 4).map((member) => (
              <HomeMemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
