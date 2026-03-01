import Link from 'next/link';
import { MemberCard, type MemberCardData } from '@/components/shared/MemberCard';

interface FeaturedMembersSectionProps {
  members: MemberCardData[];
}

export default function FeaturedMembersSection({
  members,
}: FeaturedMembersSectionProps) {
  if (members.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-label mb-2">Our Network</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              Featured Members
            </h2>
          </div>
          <Link
            href="/members"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-navy hover:text-brand-blue transition-colors"
          >
            View all
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {/* Grid: 2 cols mobile → 3 cols tablet → 6 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {members.slice(0, 6).map((member) => (
            <MemberCard key={member.id} member={member} variant="teaser" />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 sm:hidden text-center">
          <Link
            href="/members"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy hover:text-brand-blue transition-colors"
          >
            View all members →
          </Link>
        </div>
      </div>
    </section>
  );
}
