import { MetadataRoute } from 'next';
import { metaData } from './lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/', 
          '/admin/', 
          '/private/',
          '/feed/', // Prevent duplicate feed URLs
          '/*.xml', // Prevent direct access to XML files
          '/*.json', // Prevent direct access to JSON files
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/feed/',
          '/*.xml',
          '/*.json',
        ],
      },
    ],
    sitemap: `${metaData.baseUrl}/sitemap.xml`,
    host: metaData.baseUrl,
  };
}
