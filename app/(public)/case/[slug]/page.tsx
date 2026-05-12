import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateCaseMetadata, generateLegalCaseJsonLd } from '@/lib/seo'
import HearingTimeline from '@/components/HearingTimeline'
import SightingList from '@/components/SightingList'
import SightingForm from '@/components/SightingForm'
import DisputeForm from '@/components/DisputeForm'
import ShareCaseCard from '@/components/ShareCaseCard'
import PublicNotice from '@/components/PublicNotice'
import AccusedResponseForm from '@/components/AccusedResponseForm'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import type { Metadata } from 'next'
import { transliterate } from 'transliteration'
import AlertForm from '@/components/AlertForm'

export const revalidate = 86400

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ respond?: string }>
}

export async function generateStaticParams() {
  try {
    const cases = await prisma.case.findMany({
      select: { slug: true },
      where: { status: { not: 'ARCHIVED' } },
    })
    return cases.map((c: { slug: string }) => ({ slug: c.slug }))
  } catch {
    // DB not available at build time — pages generated on-demand via ISR
    return []
  }
}

async function getCase(slug: string) {
  return prisma.case.findUnique({
    where: { slug },
    include: {
      hearings: { orderBy: { date: 'desc' } },
      sightings: {
        where: { isApproved: true, isRemoved: false },
        orderBy: { upvotes: 'desc' },
      },
      filedBy: { select: { name: true } },
    },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const caseData = await getCase(slug)
  if (!caseData) return { title: 'Case not found' }

  return generateCaseMetadata({
    accusedName: caseData.accusedName,
    courtName: caseData.courtName,
    cnrNumber: caseData.cnrNumber,
    caseType: caseData.caseType,
    missedHearings: caseData.missedHearings,
    nextHearingDate: caseData.nextHearingDate,
    accusedAliases: caseData.accusedAliases,
    slug,
  })
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-red-100 text-red-800 border-red-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
  DISMISSED: 'bg-gray-100 text-gray-700 border-gray-200',
  ACQUITTED: 'bg-blue-100 text-blue-800 border-blue-200',
  ARCHIVED: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default async function CasePage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { respond } = await searchParams
  const caseData = await getCase(slug)
  if (!caseData) notFound()

  const isResolved = ['RESOLVED', 'DISMISSED', 'ACQUITTED'].includes(caseData.status)
  const jsonLd = generateLegalCaseJsonLd({
    cnrNumber: caseData.cnrNumber,
    caseType: caseData.caseType,
    courtName: caseData.courtName,
    filingDate: caseData.filingDate,
    description: `${caseData.accusedName} has a pending ${caseData.caseType} case in ${caseData.courtName}`,
  })

  const nextDate = caseData.nextHearingDate
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(caseData.nextHearingDate))
    : 'Not scheduled'

  const hindiTranslit = transliterate(caseData.accusedName)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Resolved banner */}
        {isResolved && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-center">
            <p className="font-semibold text-green-800">
              This case has been {caseData.status.toLowerCase()}
            </p>
            <p className="text-sm text-green-600 mt-1">
              This listing is retained for public record. Contact us to request removal.
            </p>
          </div>
        )}

        {/* Header banner */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-red-800 uppercase text-sm tracking-wide">
                Pending Court Case
              </p>
              <p className="text-xs text-red-600">CNR: {caseData.cnrNumber}</p>
            </div>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${STATUS_COLORS[caseData.status]}`}>
            {caseData.status}
          </span>
        </div>

        {/* Case identity */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-start gap-4">
            {caseData.accusedPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={caseData.accusedPhotoUrl}
                alt={caseData.accusedName}
                className="w-20 h-20 rounded-full object-cover border-2 border-red-200 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold mb-1">{caseData.accusedName}</h1>
              {/* Hindi transliteration — indexed but visually subtle */}
              <p className="text-gray-400 text-sm mb-2" aria-label="Name transliteration">
                {hindiTranslit}
              </p>
              {caseData.accusedAliases.length > 0 && (
                <p className="text-sm text-gray-500 mb-2">
                  Also known as:{' '}
                  <span className="font-medium">{caseData.accusedAliases.join(', ')}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                {caseData.accusedCity && <span>📍 {caseData.accusedCity}</span>}
                {caseData.accusedEmployer && <span>🏢 {caseData.accusedEmployer}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Court details */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Court Details</h2>
            <a
              href={`https://services.ecourts.gov.in/ecourtindiaservices/index.php?p=casestatus/getCNRDetails&CNR_number=${caseData.cnrNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Verify on eCourts ↗
            </a>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              ['Court', caseData.courtName],
              ['State', caseData.courtState],
              ['District', caseData.courtDistrict],
              ['Case Type', caseData.caseType],
              ['Case Year', caseData.caseYear.toString()],
              ['CNR Number', caseData.cnrNumber],
              ['Filing Date', caseData.filingDate
                ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(caseData.filingDate))
                : '—'],
              ['Hearings', `${caseData.hearingCount} total, ${caseData.missedHearings} missed`],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="text-gray-400 text-xs uppercase tracking-wide">{label}</dt>
                <dd className="font-medium mt-0.5">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Hearing timeline */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Hearing Timeline</h2>
          <HearingTimeline hearings={caseData.hearings} />
        </div>

        {/* Next hearing alert */}
        {!isResolved && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-lg mb-1">Next Hearing</h2>
            <p className="text-2xl font-bold text-amber-700 mb-3">{nextDate}</p>
            <p className="text-sm text-gray-600 mb-4">
              Get an email reminder before this hearing.
            </p>
            <AlertForm caseId={caseData.id} />
          </div>
        )}

        {/* AI order summary */}
        {caseData.lastOrderSummary && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-2">Last Order Summary</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{caseData.lastOrderSummary}</p>
          </div>
        )}

        {/* Tabs: Sightings / Notice / Share */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <Tabs defaultValue="sightings">
            <TabsList className="mb-6">
              <TabsTrigger value="sightings">
                Sightings ({caseData.sightings.length})
              </TabsTrigger>
              <TabsTrigger value="notice">Print Notice</TabsTrigger>
              <TabsTrigger value="share">Share</TabsTrigger>
            </TabsList>

            <TabsContent value="sightings" className="space-y-6">
              <SightingList sightings={caseData.sightings} />
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Submit a sighting</h3>
                <SightingForm caseId={caseData.id} />
              </div>
            </TabsContent>

            <TabsContent value="notice">
              <PublicNotice
                caseData={caseData}
                filerContact={caseData.filedBy.name ?? undefined}
              />
              <div className="mt-4 text-center">
                <button
                  onClick={() => window.print()}
                  className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 no-print text-sm"
                >
                  Print as PDF
                </button>
              </div>
            </TabsContent>

            <TabsContent value="share">
              <ShareCaseCard slug={caseData.slug} accusedName={caseData.accusedName} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Accused response */}
        {caseData.accusedStatement ? (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-2">Response from the Accused</h2>
            <p className="text-sm text-gray-400 mb-3">
              Submitted on{' '}
              {caseData.accusedResponseAt
                ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
                    new Date(caseData.accusedResponseAt)
                  )
                : '—'}
            </p>
            <blockquote className="border-l-4 border-blue-300 pl-4 text-gray-700 italic">
              {caseData.accusedStatement}
            </blockquote>
          </div>
        ) : respond === 'true' ? (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Submit Your Response</h2>
            <AccusedResponseForm caseId={caseData.id} slug={caseData.slug} />
          </div>
        ) : (
          <div className="text-center mb-6">
            <Link
              href={`/case/${caseData.slug}?respond=true`}
              className="text-sm text-gray-500 hover:text-blue-600 underline"
            >
              Are you the accused? Submit a response
            </Link>
          </div>
        )}

        {/* Dispute this listing */}
        <details className="bg-white rounded-xl border p-6 mb-6">
          <summary className="font-semibold cursor-pointer text-gray-700 hover:text-red-600">
            Dispute this listing
          </summary>
          <div className="mt-4">
            <DisputeForm caseId={caseData.id} />
          </div>
        </details>

        {/* Hidden aliases for SEO indexing */}
        {caseData.accusedAliases.length > 0 && (
          <span className="sr-only">
            Also known as: {caseData.accusedAliases.join(', ')}
          </span>
        )}
        <meta name="keywords" content={[caseData.accusedName, ...caseData.accusedAliases, caseData.courtName].join(', ')} />
      </div>
    </>
  )
}
