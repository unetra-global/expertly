import { cn } from '@/lib/utils';

// ── Verified badge ────────────────────────────────────────────────────────────

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function VerifiedBadge({ className, size = 'md' }: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100',
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className,
      )}
      title="Verified Expert"
    >
      <svg
        className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  );
}

// ── Tier badge ────────────────────────────────────────────────────────────────

type MemberTier = 'seasoned' | 'budding' | string;

interface TierBadgeProps {
  tier: MemberTier;
  className?: string;
  size?: 'sm' | 'md';
}

const TIER_STYLES: Record<string, string> = {
  seasoned:
    'bg-amber-50 text-amber-700 border-amber-200',
  budding:
    'bg-gray-50 text-gray-600 border-gray-200',
};

const TIER_LABELS: Record<string, string> = {
  seasoned: 'Seasoned',
  budding: 'Budding',
};

export function TierBadge({ tier, className, size = 'md' }: TierBadgeProps) {
  const styles = TIER_STYLES[tier] ?? 'bg-gray-50 text-gray-600 border-gray-200';
  const label = TIER_LABELS[tier] ?? tier;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        styles,
        className,
      )}
    >
      {label}
    </span>
  );
}

// ── Generic status badge ──────────────────────────────────────────────────────

interface StatusBadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

export function StatusBadge({
  label,
  variant = 'default',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        STATUS_STYLES[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
