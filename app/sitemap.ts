import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://degenzone.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`,    lastModified: now, priority: 1.0,  changeFrequency: 'daily' },
    { url: `${SITE_URL}/app`, lastModified: now, priority: 0.9,  changeFrequency: 'always' },
  ];
}
