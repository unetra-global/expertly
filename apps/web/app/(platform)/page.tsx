import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import FeatureCardsSection from '@/components/home/FeatureCardsSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturedMembersSection from '@/components/home/FeaturedMembersSection';
import LatestArticlesSection from '@/components/home/LatestArticlesSection';
import UpcomingEventsSection, {
  type HomepageEvent,
} from '@/components/home/UpcomingEventsSection';
import type { MemberCardData } from '@/components/shared/MemberCard';
import type { ArticleCardData } from '@/components/shared/ArticleCard';

// ISR: revalidate every 5 minutes
export const revalidate = 300;

export const metadata: Metadata = {
  title:
    'Expertly — The Professional Network for Finance & Legal Experts',
  description:
    'Connect with verified finance and legal professionals. Read expert insights. Discover events.',
};

interface HomepageData {
  featuredMembers: MemberCardData[];
  latestArticles: ArticleCardData[];
  upcomingEvents: HomepageEvent[];
}

async function getHomepageData(): Promise<HomepageData> {
  const empty: HomepageData = {
    featuredMembers: [],
    latestArticles: [],
    upcomingEvents: [],
  };

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

  try {
    const res = await fetch(`${apiUrl}/homepage`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return empty;

    const json = (await res.json()) as {
      success: boolean;
      data?: HomepageData;
    };

    return json.data ?? empty;
  } catch {
    // Graceful degradation if API is unreachable
    return empty;
  }
}

export default async function HomePage() {
  const { featuredMembers, latestArticles, upcomingEvents } =
    await getHomepageData();

  return (
    <>
      {/* Hero + Feature cards + Stats sit on the dark navy band */}
      <HeroSection />
      <FeatureCardsSection />
      <StatsSection />

      {/* Light sections */}
      <FeaturedMembersSection members={featuredMembers} />
      <LatestArticlesSection articles={latestArticles} />
      <UpcomingEventsSection events={upcomingEvents} />

      {/* CTA strip */}
      <section className="bg-brand-navy py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to join the network?
          </h2>
          <p className="text-white/60 mb-8 text-sm sm:text-base">
            Apply for verified membership and connect with finance &amp; legal
            professionals worldwide.
          </p>
          <a
            href="/application"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-sm transition-colors"
          >
            Apply for Membership
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}
