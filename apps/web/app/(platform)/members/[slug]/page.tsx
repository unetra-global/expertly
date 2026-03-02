import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { MemberProfile } from '@/components/members/MemberProfile';
import type { MemberFullProfile } from '@/types/api';

export const revalidate = 600;

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1';

async function fetchMember(slug: string): Promise<MemberFullProfile | null> {
  try {
    const res = await fetch(`${API}/members/${slug}`, {
      next: { revalidate: 600 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success: boolean;
      data?: MemberFullProfile;
    };
    return json.data ?? null;
  } catch {
    return null;
  }
}

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const member = await fetchMember(params.slug);
  if (!member) return { title: 'Member Not Found | Expertly' };

  const displayName =
    member.user.fullName ||
    [member.user.firstName, member.user.lastName].filter(Boolean).join(' ') ||
    'Expert';

  const description =
    member.headline ??
    [member.designation, member.primaryService?.name, member.country]
      .filter(Boolean)
      .join(' · ');

  return {
    title: `${displayName} — ${member.designation ?? member.primaryService?.name ?? 'Expert'} | Expertly`,
    description,
    openGraph: {
      title: displayName,
      description,
      images: member.profilePhotoUrl ? [{ url: member.profilePhotoUrl }] : [],
      type: 'profile',
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: displayName,
        jobTitle: member.designation,
        description: member.headline,
        image: member.profilePhotoUrl,
        url: `https://expertly.net/members/${member.slug}`,
        ...(member.firmName
          ? { worksFor: { '@type': 'Organization', name: member.firmName } }
          : {}),
        address: {
          '@type': 'PostalAddress',
          addressLocality: member.city,
          addressCountry: member.country,
        },
      }),
    },
  };
}

export default async function MemberSlugPage({ params }: PageProps) {
  const [member, supabase] = await Promise.all([
    fetchMember(params.slug),
    Promise.resolve(createServerClient()),
  ]);

  if (!member) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <MemberProfile member={member} isAuthenticated={!!user} />;
}
