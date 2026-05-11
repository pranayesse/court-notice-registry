import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import CaseCard from '@/components/CaseCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      cases: {
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { sightings: true, disputes: true } } },
      },
    },
  })

  const cases = dbUser?.cases ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My cases</h1>
          <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
        </div>
        <Link
          href="/dashboard/new"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
        >
          + File new case
        </Link>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-16 rounded-xl border bg-gray-50">
          <p className="text-4xl mb-4">📂</p>
          <p className="font-semibold text-gray-700">No cases filed yet</p>
          <Link href="/dashboard/new" className="mt-4 inline-block text-red-600 hover:underline text-sm">
            File your first case notice
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((c: typeof cases[number]) => (
            <div key={c.id} className="relative">
              <CaseCard
                slug={c.slug}
                accusedName={c.accusedName}
                courtName={c.courtName}
                caseType={c.caseType}
                nextHearingDate={c.nextHearingDate}
                missedHearings={c.missedHearings}
                status={c.status}
              />
              <div className="absolute top-3 right-3 flex gap-2 text-xs">
                {c._count.sightings > 0 && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {c._count.sightings} sightings
                  </span>
                )}
                {c._count.disputes > 0 && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    {c._count.disputes} disputes
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
