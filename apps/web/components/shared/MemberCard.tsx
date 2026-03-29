import Link from 'next/link';
import { VerifiedBadge, TierBadge } from './Badge';
import { cn } from '@/lib/utils';

export interface MemberCardData {
  id: string;
  slug: string;
  profilePhotoUrl?: string;
  avatarUrl?: string;
  designation?: string;
  city?: string;
  country?: string;
  isVerified?: boolean;
  memberTier?: string;
  /** Joined primary service — Supabase returns table name 'services' */
  services?: {
    name?: string;
    categories?: { id?: string; name?: string };
  };
  /** Joined user — Supabase returns table name 'users' */
  users?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
  };
}

interface MemberCardProps {
  member: MemberCardData;
  className?: string;
  /**
   * 'teaser' = limited info (for guests)
   * 'full'   = all fields shown (for authenticated users)
   */
  variant?: 'teaser' | 'full';
}

export function MemberCard({
  member,
  className,
  variant = 'teaser',
}: MemberCardProps) {
  const photoUrl = member.profilePhotoUrl || member.avatarUrl;
  const displayName =
    member.users?.fullName ||
    [member.users?.firstName, member.users?.lastName].filter(Boolean).join(' ') ||
    'Expert';

  const location = [member.city, member.country].filter(Boolean).join(', ');
  const serviceName = member.services?.name;

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/members/${member.slug}`}
      className={cn(
        'group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-gold/40 hover:shadow-card-hover transition-all duration-200',
        className,
      )}
    >
      {/* Avatar with verified dot */}
      <div className="flex-shrink-0 relative">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={displayName}
            className="w-14 h-14 rounded-xl object-cover object-top border-2 border-gray-100 group-hover:border-brand-gold/30 transition-colors"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-brand-navy flex items-center justify-center text-white font-bold text-xl">
            {initials}
          </div>
        )}
        {member.isVerified && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
            <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Verified">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-brand-navy text-sm leading-snug truncate">
            {displayName}
          </h3>
          {member.memberTier && (
            <TierBadge tier={member.memberTier} size="sm" />
          )}
        </div>

        {member.designation && (
          <p className="mt-0.5 text-xs text-gray-500 leading-snug line-clamp-1">
            {member.designation}
          </p>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {serviceName && (
            <span className="inline-flex items-center rounded-full bg-brand-blue-subtle px-2 py-0.5 text-[11px] font-semibold text-brand-blue">
              {serviceName}
            </span>
          )}
          {location && (
            <span className="text-[11px] text-gray-400">{location}</span>
          )}
        </div>
      </div>

      {/* Arrow / "View profile" */}
      {variant === 'full' ? (
        <span className="flex-shrink-0 text-xs font-semibold text-brand-blue group-hover:text-brand-gold transition-colors whitespace-nowrap hidden sm:block">
          View profile
        </span>
      ) : null}
      <svg
        className="h-4 w-4 text-gray-200 group-hover:text-brand-gold group-hover:translate-x-0.5 transition-all flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
