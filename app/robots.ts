import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/agent/', '/track/driver/', '/api/'],
    },
    sitemap: 'https://praemiumonuslogistics.vercel.app/sitemap.xml',
  };
}
