import { prisma } from '@/lib/prisma'
import CaseCard from '@/components/CaseCard'
import CaseSearchBar from '@/components/CaseSearchBar'
import type { Metadata } from 'next'
import { CaseStatus, Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface SearchPageProps {
  searchParams: { q?: string; state?: string; district?: string; type?: string; year?: string; status?: string }
}

export function generateMetadata({ searchParams }: SearchPageProps): Metadata {
  const q = searchParams.q ?? ''
  return {
    title: q ? `Search results for "${q}" — Court Notice Registry` : 'Search Court Cases — PendingCase.in',
    robots: { index: false },
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = searchParams.q?.trim() ?? ''
  const { state, district, type, year, status } = searchParams

  const where: Prisma.CaseWhereInput = {}

  if (q) {
    where.OR = [
      { accusedName: { contains: q, mode: 'insensitive' } },
      { accusedAliases: { has: q } },
      { courtName: { contains: q, mode: 'insensitive' } },
      { caseType: { contains: q, mode: 'insensitive' } },
      { cnrNumber: { contains: q, mode: 'insensitive' } },
      { accusedEmployer: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (state) where.courtState = { equals: state, mode: 'insensitive' }
  if (district) where.courtDistrict = { equals: district, mode: 'insensitive' }
  if (type) where.caseType = { contains: type, mode: 'insensitive' }
  if (year) where.caseYear = parseInt(year)
  if (status && Object.values(CaseStatus).includes(status as CaseStatus)) {
    where.status = status as CaseStatus
  }

  const cases = await prisma.case.findMany({
    where,
    take: 50,
    orderBy: { createdAt: 'desc' },
  })

  const states = await prisma.case.findMany({
    distinct: ['courtState'],
    select: { courtState: true },
    orderBy: { courtState: 'asc' },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <CaseSearchBar defaultValue={q} />
      </div>

      {/* Filters */}
      <form method="GET" action="/search" className="flex flex-wrap gap-3 mb-8 text-sm">
        {q && <input type="hidden" name="q" value={q} />}

        <select name="state" defaultValue={state ?? ''} className="border rounded px-2 py-1.5 bg-white">
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s.courtState} value={s.courtState}>{s.courtState}</option>
          ))}
        </select>

        <select name="status" defaultValue={status ?? ''} className="border rounded px-2 py-1.5 bg-white">
          <option value="">All statuses</option>
          {Object.values(CaseStatus).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="number"
          name="year"
          defaultValue={year ?? ''}
          placeholder="Year"
          min={1990}
          max={new Date().getFullYear()}
          className="border rounded px-2 py-1.5 w-24 bg-white"
        />

        <button type="submit" className="bg-gray-800 text-white px-4 py-1.5 rounded hover:bg-gray-900">
          Apply filters
        </button>

        {(state || status || year || type) && (
          <a href={`/search${q ? `?q=${encodeURIComponent(q)}` : ''}`} className="text-gray-500 hover:text-red-600 underline self-center">
            Clear filters
          </a>
        )}
      </form>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">
          {q ? `Results for "${q}"` : 'All cases'}
        </h1>
        <span className="text-sm text-gray-500">{cases.length} result{cases.length !== 1 ? 's' : ''}</span>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-medium">No cases found</p>
          {q && <p className="text-sm mt-1">Try a different name, CNR, or employer</p>}
        </div>
      ) : (
        <div className="grid gap-3">
          {cases.map((c) => (
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
    </div>
  )
}
