import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/ops/',
          '/member/',
          '/onboarding',
          '/application/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://expertly.net/sitemap.xml',
  };
}
