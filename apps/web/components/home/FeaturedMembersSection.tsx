import Link from 'next/link';
import { MemberCard, type MemberCardData } from '@/components/shared/MemberCard';

interface FeaturedMembersSectionProps {
  members: MemberCardData[];
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
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors border border-brand-blue/30 rounded-lg px-4 py-2 hover:bg-brand-blue-subtle"
          >
            View All
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {members.length === 0 ? (
          <div className="rounded-2xl bg-brand-surface border border-gray-100 py-12 text-center">
            <p className="text-sm text-brand-text-muted">No featured members found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {members.slice(0, 6).map((member) => (
              <MemberCard key={member.id} member={member} variant="teaser" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
