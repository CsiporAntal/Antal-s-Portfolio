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
          '/feed/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/feed/',
        ],
      },
    ],
    sitemap: `${metaData.baseUrl}/sitemap.xml`,
    host: metaData.baseUrl,
  };
}
