import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/minha-conta/', '/checkout/', '/login/', '/cadastro/'],
    },
    sitemap: 'https://www.jpbstorex.com.br/sitemap.xml',
  };
}
