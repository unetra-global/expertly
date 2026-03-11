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
    serviceCategories?: { id?: string; name?: string };
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
        'group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        className,
      )}
    >
      <div className="p-5">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-brand-navy/20 transition-colors"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand-navy flex items-center justify-center text-white font-semibold text-lg">
              {initials}
            </div>
          )}
        </div>

        {/* Name + badges */}
        <div className="text-center">
          <h3 className="font-semibold text-brand-navy text-sm leading-snug group-hover:text-brand-navy">
            {displayName}
          </h3>

          {member.designation && (
            <p className="mt-1 text-xs text-gray-500 leading-snug line-clamp-2">
              {member.designation}
            </p>
          )}

          {serviceName && (
            <p className="mt-1.5 text-xs font-medium text-brand-blue">
              {serviceName}
            </p>
          )}

          {location && (
            <p className="mt-1 text-xs text-gray-400 flex items-center justify-center gap-1">
              <svg
                className="h-3 w-3 flex-shrink-0"
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
              {location}
            </p>
          )}

          {/* Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            {member.isVerified && <VerifiedBadge size="sm" />}
            {member.memberTier && (
              <TierBadge tier={member.memberTier} size="sm" />
            )}
          </div>

          {/* Full variant extras */}
          {variant === 'full' && (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <span className="text-xs text-brand-navy font-medium group-hover:underline">
                View profile →
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
