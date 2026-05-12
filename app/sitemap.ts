import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pendingcase.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cases = await prisma.case.findMany({
    where: { status: { not: 'ARCHIVED' } },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const caseUrls: MetadataRoute.Sitemap = cases.map((c) => ({
    url: `${BASE_URL}/case/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'biweekly',
    priority: 0.8,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/verify`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...caseUrls,
  ]
}
