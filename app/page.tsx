import { prisma } from '@/lib/prisma'
import CaseCard from '@/components/CaseCard'
import CaseSearchBar from '@/components/CaseSearchBar'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const [totalCases, activeCases, totalSightings] = await Promise.all([
      prisma.case.count(),
      prisma.case.count({ where: { status: 'ACTIVE' } }),
      prisma.sighting.count({ where: { isApproved: true } }),
    ])
    return { totalCases, activeCases, totalSightings }
  } catch {
    return { totalCases: 0, activeCases: 0, totalSightings: 0 }
  }
}

async function getRecentCases() {
  try {
    return prisma.case.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: { status: { not: 'ARCHIVED' } },
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [stats, recentCases] = await Promise.all([getStats(), getRecentCases()])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-1.5 rounded-full mb-6">
          <span>⚠️</span> India&apos;s public court notice registry
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Search pending court cases
          <br />
          <span className="text-red-600">in India</span>
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
          Verified case data from eCourts India. File public notices. Track hearing dates.
          Get alerts before hearings.
        </p>

        <div className="max-w-xl mx-auto mb-6">
          <CaseSearchBar size="lg" />
        </div>

        <Link
          href="/dashboard/new"
          className="text-sm text-gray-500 hover:text-red-600 underline underline-offset-4"
        >
          File a case notice — free
        </Link>
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-3 gap-4 mb-12 text-center">
        {[
          { value: stats.totalCases.toLocaleString('en-IN'), label: 'Cases filed' },
          { value: stats.activeCases.toLocaleString('en-IN'), label: 'Active cases' },
          { value: stats.totalSightings.toLocaleString('en-IN'), label: 'Sightings submitted' },
        ].map(({ value, label }) => (
          <div key={label} className="bg-white rounded-xl border p-4">
            <p className="text-3xl font-bold text-red-600">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </section>

      {/* Recent filings */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent filings</h2>
        {recentCases.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No cases filed yet.</p>
            <Link href="/dashboard/new" className="text-red-600 hover:underline mt-2 inline-block">
              Be the first to file a notice
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {recentCases.map((c) => (
              <CaseCard
                key={c.id}
                slug={c.slug}
                accusedName={c.accusedName}
                courtName={c.courtName}
                caseType={c.caseType}
                nextHearingDate={c.nextHearingDate}
                missedHearings={c.missedHearings}
                status={c.status}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
