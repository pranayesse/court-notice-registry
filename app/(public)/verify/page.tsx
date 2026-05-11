import { prisma } from '@/lib/prisma'
import CaseCard from '@/components/CaseCard'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Verify — Check if Someone Has a Pending Court Case | PendingCase.in',
  description: 'Enter a name or CNR number to check if someone has a pending court case in India.',
  robots: { index: true, follow: true },
}

interface VerifyPageProps {
  searchParams: Promise<{ q?: string; cnr?: string }>
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { q: rawQ, cnr: rawCnr } = await searchParams
  const q = rawQ?.trim() ?? ''
  const cnr = rawCnr?.trim().toUpperCase() ?? ''

  let results: Awaited<ReturnType<typeof prisma.case.findMany>> = []
  let searched = false

  if (q || cnr) {
    searched = true
    results = await prisma.case.findMany({
      where: {
        status: { not: 'ARCHIVED' },
        ...(cnr
          ? { cnrNumber: cnr }
          : {
              OR: [
                { accusedName: { contains: q, mode: 'insensitive' } },
                { accusedAliases: { has: q } },
              ],
            }),
      },
      take: 20,
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Verify a person</h1>
        <p className="text-gray-500">
          Check whether someone has a pending court case. Enter their name or the CNR number.
        </p>
      </div>

      <form method="GET" action="/verify" className="space-y-4 mb-8">
        <div>
          <label htmlFor="q" className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={q}
            placeholder="e.g. Rahul Kumar"
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="flex-1 border-t" />
          <span>or</span>
          <span className="flex-1 border-t" />
        </div>
        <div>
          <label htmlFor="cnr" className="block text-sm font-medium text-gray-700 mb-1">
            CNR Number
          </label>
          <input
            id="cnr"
            name="cnr"
            type="text"
            defaultValue={cnr}
            placeholder="e.g. DLHC010001232024"
            className="w-full border rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700"
        >
          Check now
        </button>
      </form>

      {searched && (
        <div>
          {results.length === 0 ? (
            <div className="text-center py-10 rounded-xl border bg-green-50">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-semibold text-green-800">No pending cases found</p>
              <p className="text-sm text-gray-500 mt-1">
                {q || cnr} does not appear in our registry.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚠️</span>
                <p className="font-semibold text-red-700">
                  {results.length} pending case{results.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="grid gap-3">
                {results.map((c) => (
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
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center text-xs text-gray-400">
        10 checks/day free per IP. For bulk API access,{' '}
        <a href="mailto:api@pendingcase.in" className="underline">
          contact us
        </a>
        .
      </div>
    </div>
  )
}
