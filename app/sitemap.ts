import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://praemiumonuslogistics.vercel.app';
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/services`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/shippers`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/carriers`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/quote`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: 'weekly', priority: 0.6 },
  ];
}
