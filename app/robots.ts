import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pendingcase.in'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin', '/api/', '/login', '/register'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
