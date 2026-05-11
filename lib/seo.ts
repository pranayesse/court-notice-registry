import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pendingcase.in'

export function generateCaseMetadata(params: {
  accusedName: string
  courtName: string
  cnrNumber: string
  caseType: string
  missedHearings: number
  nextHearingDate: Date | null
  accusedAliases: string[]
  slug: string
}): Metadata {
  const { accusedName, courtName, cnrNumber, caseType, missedHearings, nextHearingDate, accusedAliases, slug } = params

  const nextDate = nextHearingDate
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(nextHearingDate))
    : 'TBD'

  const title = `Pending Case: ${accusedName} — ${courtName} · ${cnrNumber}`
  const description = `⚠️ ${accusedName} has a pending ${caseType} case in ${courtName}. ${missedHearings} hearings missed. Next date: ${nextDate}.`

  return {
    title,
    description,
    keywords: [accusedName, ...accusedAliases, courtName, caseType, cnrNumber, 'pending court case India'],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/case/${slug}`,
      type: 'article',
      images: [{ url: `${BASE_URL}/api/og?slug=${slug}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/api/og?slug=${slug}`],
    },
    alternates: { canonical: `${BASE_URL}/case/${slug}` },
    robots: { index: true, follow: true },
  }
}

export function generateLegalCaseJsonLd(params: {
  cnrNumber: string
  caseType: string
  courtName: string
  filingDate: Date | null
  description: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LegalCase',
    name: `[${params.cnrNumber}] ${params.caseType}`,
    description: params.description,
    datePublished: params.filingDate?.toISOString() ?? new Date().toISOString(),
    jurisdiction: 'India',
    court: {
      '@type': 'Courthouse',
      name: params.courtName,
    },
  }
}
