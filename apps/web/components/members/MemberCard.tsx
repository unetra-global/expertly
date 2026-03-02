import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { MemberListItem } from '@/types/api';

interface MemberCardProps {
  member: MemberListItem;
  /**
   * 'teaser' — guest view: name, designation, service, location, badges only
   * 'full'   — authenticated view: adds headline, years, fee range, consult CTA
   */
  variant?: 'teaser' | 'full';
  onConsult?: (member: MemberListItem) => void;
  className?: string;
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Verified
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const isSeasoned = tier.toLowerCase() === 'seasoned';
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
      isSeasoned
        ? 'bg-amber-50 border-amber-200 text-amber-700'
        : 'bg-gray-50 border-gray-200 text-gray-600'
    )}>
      {isSeasoned ? '★' : '◆'} {tier}
    </span>
  );
}

export function MemberCard({ member, variant = 'teaser', onConsult, className }: MemberCardProps) {
  const displayName =
    member.user.fullName ||
    [member.user.firstName, member.user.lastName].filter(Boolean).join(' ') ||
    'Expert';

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const location = [member.city, member.country].filter(Boolean).join(', ');
  const hasFeeRange = member.feeRangeMin || member.feeRangeMax;

  return (
    <div className={cn(
      'group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden',
      className
    )}>
      <div className="p-5 flex gap-4">
        {/* Avatar */}
        <Link href={`/members/${member.slug}`} className="flex-shrink-0">
          {member.profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.profilePhotoUrl}
              alt={displayName}
              className="w-16 h-16 rounded-xl object-cover border border-gray-100 group-hover:border-brand-blue/20 transition-colors"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-brand-navy flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
              {initials}
            </div>
          )}
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/members/${member.slug}`}>
                <h3 className="font-semibold text-brand-navy text-base leading-snug hover:text-brand-blue transition-colors truncate">
                  {displayName}
                </h3>
              </Link>
              {member.designation && (
                <p className="text-xs text-brand-text-secondary mt-0.5 truncate">{member.designation}</p>
              )}
              {member.firmName && (
                <p className="text-xs text-brand-text-muted truncate">{member.firmName}</p>
              )}
            </div>

            {/* Desktop: View Profile */}
            <Link
              href={`/members/${member.slug}`}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-brand-navy hover:text-brand-blue transition-colors whitespace-nowrap flex-shrink-0"
            >
              View profile
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Service + Location row */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {member.primaryService?.name && (
              <span className="inline-flex items-center rounded-full bg-brand-blue-subtle border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-brand-blue">
                {member.primaryService.name}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-text-muted">
                <svg className="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {member.isVerified && <VerifiedBadge />}
            {member.memberTier && <TierBadge tier={member.memberTier} />}
          </div>

          {/* Full variant: headline + stats + CTA */}
          {variant === 'full' && (
            <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
              {member.headline && (
                <p className="text-xs text-brand-text-secondary leading-relaxed line-clamp-2">
                  {member.headline}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-brand-text-muted">
                {member.yearsOfExperience && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {member.yearsOfExperience}+ yrs
                  </span>
                )}
                {hasFeeRange && member.memberTier?.toLowerCase() === 'seasoned' && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {member.feeCurrency ?? '$'}{member.feeRangeMin?.toLocaleString()}
                    {member.feeRangeMax ? `–${member.feeCurrency ?? '$'}${member.feeRangeMax.toLocaleString()}` : '+'}
                    /hr
                  </span>
                )}
              </div>
              {onConsult && (
                <button
                  onClick={() => onConsult(member)}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold px-3 py-1.5 transition-colors"
                >
                  Request Consultation
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
