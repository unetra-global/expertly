import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1';

  const [membersRes, articlesRes] = await Promise.all([
    fetch(`${API}/members?limit=500`, { next: { revalidate: 3600 } }),
    fetch(`${API}/articles?limit=500&status=published`, {
      next: { revalidate: 3600 },
    }),
  ]);

  const membersJson = (await membersRes.json().catch(() => ({ data: null }))) as {
    data?: { data?: Array<{ slug: string; updated_at?: string }> } | null;
  };
  const articlesJson = (await articlesRes.json().catch(() => ({ data: null }))) as {
    data?: { data?: Array<{ slug: string; published_at?: string }> } | null;
  };

  const members: Array<{ slug: string; updated_at?: string }> =
    membersJson.data?.data ?? [];
  const articles: Array<{ slug: string; published_at?: string }> =
    articlesJson.data?.data ?? [];

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://expertly.net',
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://expertly.net/members',
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://expertly.net/articles',
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://expertly.net/events',
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const memberPages: MetadataRoute.Sitemap = members.map((m) => ({
    url: `https://expertly.net/members/${m.slug}`,
    lastModified: m.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `https://expertly.net/articles/${a.slug}`,
    lastModified: a.published_at,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...memberPages, ...articlePages];
}
