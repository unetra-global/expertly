import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { MemberListItem } from '@/types/api';

interface MemberCardProps {
  member: MemberListItem;
  /**
   * 'teaser' — guest view: name, designation, service, location, badges only
   * 'full'   — authenticated view: adds headline, bio, years, fee range, consult CTA
   */
  variant?: 'teaser' | 'full';
  onConsult?: (member: MemberListItem) => void;
  className?: string;
}

function TierBadge({ tier }: { tier: string }) {
  const lower = tier.toLowerCase();
  const isSeasoned = lower.includes('seasoned');
  const isBudding = lower.includes('budding') || lower.includes('rising');

  if (isSeasoned) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        🏆 Seasoned
      </span>
    );
  }
  if (isBudding) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-semibold text-green-700">
        🌱 Budding
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
      ◆ {tier.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}

export function MemberCard({ member, variant = 'teaser', onConsult, className }: MemberCardProps) {
  const displayName =
    member.users?.fullName ||
    [member.users?.firstName, member.users?.lastName].filter(Boolean).join(' ') ||
    'Expert';

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const location = [member.city, member.country].filter(Boolean).join(', ');
  const hasFeeRange = !!(member.feeRangeMin || member.feeRangeMax);

  const feeLabel = hasFeeRange
    ? `${member.feeCurrency ?? '$'}${member.feeRangeMin?.toLocaleString() ?? ''}${member.feeRangeMax ? `–${member.feeCurrency ?? '$'}${member.feeRangeMax.toLocaleString()}` : '+'}/hr`
    : null;

  return (
    <div className={cn(
      'group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden',
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
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-brand-blue/30 transition-colors"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand-navy flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
              {initials}
            </div>
          )}
        </Link>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top row: name + tier + View Profile */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2 flex-wrap">
              <Link href={`/members/${member.slug}`}>
                <h3 className="font-bold text-brand-navy text-base leading-snug hover:text-brand-blue transition-colors">
                  {displayName}
                </h3>
              </Link>
              {member.memberTier && <TierBadge tier={member.memberTier} />}
            </div>
            <Link
              href={`/members/${member.slug}`}
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-dark rounded-lg px-4 py-1.5 transition-colors whitespace-nowrap flex-shrink-0"
            >
              View Profile
            </Link>
          </div>

          {/* Designation */}
          {member.designation && (
            <p className="text-xs text-brand-text-secondary mt-1 truncate">
              {member.designation}
            </p>
          )}

          {/* Location + Years Exp */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-brand-text-muted">
            {location && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </span>
            )}
            {variant === 'full' && member.yearsOfExperience && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {member.yearsOfExperience} Years Exp.
              </span>
            )}
          </div>

          {/* Bio excerpt — authenticated only; skip if same as designation */}
          {variant === 'full' && member.headline && member.headline !== member.designation && (
            <p className="mt-2 text-sm text-brand-text-secondary leading-relaxed line-clamp-2">
              {member.headline}
            </p>
          )}

          {/* Service tags + fee */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {member.services?.categories?.name && (
              <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {member.services.categories.name}
              </span>
            )}
            {member.services?.name && member.services.name !== member.services?.categories?.name && (
              <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {member.services.name}
              </span>
            )}
            {variant === 'full' && feeLabel && (
              <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                {feeLabel}
              </span>
            )}
            {member.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </div>

          {/* Consult CTA — authenticated only */}
          {variant === 'full' && onConsult && (
            <button
              onClick={() => onConsult(member)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold px-3 py-1.5 transition-colors"
            >
              Request Consultation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
