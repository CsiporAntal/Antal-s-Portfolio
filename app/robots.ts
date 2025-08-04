import { MetadataRoute } from 'next';
import { metaData } from './lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${metaData.baseUrl}sitemap.xml`,
    host: metaData.baseUrl,
  };
}
