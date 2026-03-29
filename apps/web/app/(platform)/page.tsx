export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import FeatureCardsSection from '@/components/home/FeatureCardsSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturedMembersSection from '@/components/home/FeaturedMembersSection';
import LatestArticlesSection from '@/components/home/LatestArticlesSection';
import UpcomingEventsSection, {
  type HomepageEvent,
} from '@/components/home/UpcomingEventsSection';
import TestimonialSection from '@/components/home/TestimonialSection';
import FAQSection from '@/components/home/FAQSection';
import WhyJoinSection from '@/components/home/WhyJoinSection';
import type { MemberCardData } from '@/components/shared/MemberCard';
import type { ArticleCardData } from '@/components/shared/ArticleCard';

// ISR: revalidate every 5 minutes
export const revalidate = 300;

export const metadata: Metadata = {
  title:
    'Expertly — The Professional Network for Finance & Legal Experts',
  description:
    'Connect with verified finance and legal professionals. Read expert articles. Discover events.',
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
    (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001') + '/api/v1';

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
      <HeroSection />
      <FeatureCardsSection />
      <StatsSection />
      <FeaturedMembersSection members={featuredMembers} />
      <LatestArticlesSection articles={latestArticles} />
      <UpcomingEventsSection events={upcomingEvents} />
      <WhyJoinSection />
      <TestimonialSection />
      <FAQSection />
    </>
  );
}
