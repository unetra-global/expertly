import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { ArticleDetail } from '@/components/articles/ArticleDetail';
import type { ArticleFull } from '@/types/api';

export const dynamic = 'force-dynamic';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001') + '/api/v1';

async function fetchArticle(slug: string): Promise<ArticleFull | null> {
  try {
    const res = await fetch(`${API_BASE}/articles/${slug}`, {
      next: { revalidate: 300 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data?: ArticleFull };
    return json.data ?? null;
  } catch {
    return null;
  }
}

async function fetchRelatedArticles(articleId: string): Promise<ArticleFull[]> {
  try {
    const res = await fetch(`${API_BASE}/articles/${articleId}/related`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { success: boolean; data?: ArticleFull[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function fetchMoreByAuthor(memberId: string, excludeId: string): Promise<ArticleFull[]> {
  try {
    const res = await fetch(`${API_BASE}/articles?memberId=${memberId}&limit=4`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { success: boolean; data?: ArticleFull[] };
    return (json.data ?? []).filter((a) => a.id !== excludeId);
  } catch {
    return [];
  }
}

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await fetchArticle(params.slug);
  if (!article) return { title: 'Article Not Found | Expertly' };

  const authorName =
    article.author?.user.fullName ||
    [article.author?.user.firstName, article.author?.user.lastName].filter(Boolean).join(' ') ||
    'Expertly Author';

  return {
    title: `${article.title} | Expertly`,
    description: article.excerpt ?? article.subtitle,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? article.subtitle,
      images: article.featuredImageUrl ? [{ url: article.featuredImageUrl }] : [],
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        image: article.featuredImageUrl,
        author: {
          '@type': 'Person',
          name: authorName,
          url: article.author?.slug
            ? `https://expertly.net/members/${article.author.slug}`
            : undefined,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Expertly',
          url: 'https://expertly.net',
        },
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
      }),
    },
  };
}

export default async function ArticleSlugPage({ params }: PageProps) {
  const supabase = createServerClient();
  const [article, { data: { user } }] = await Promise.all([
    fetchArticle(params.slug),
    supabase.auth.getUser(),
  ]);

  if (!article) notFound();

  const isGuest = !user;

  const [related, moreByAuthor] = await Promise.all([
    fetchRelatedArticles(article.id),
    article.author?.id ? fetchMoreByAuthor(article.author.id, article.id) : Promise.resolve([]),
  ]);

  return (
    <ArticleDetail
      article={article}
      related={related}
      moreByAuthor={moreByAuthor}
      isGuest={isGuest}
    />
  );
}
