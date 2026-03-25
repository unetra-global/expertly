// ── Single source of truth for member tier values ─────────────────────────────
// Matches the member_tier_enum in the database.

export const MEMBER_TIERS = ['budding_entrepreneur', 'seasoned_professional'] as const;

export type MemberTier = (typeof MEMBER_TIERS)[number];

export const MEMBER_TIER_LABELS: Record<MemberTier, string> = {
  budding_entrepreneur: 'Budding Entrepreneur',
  seasoned_professional: 'Seasoned Professional',
};
