import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { refreshCase } from '@/lib/ecourts'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const activeCases = await prisma.case.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, cnrNumber: true },
  })

  const results = { updated: 0, failed: 0, acquitted: 0 }

  for (const c of activeCases) {
    try {
      const data = await refreshCase(c.cnrNumber)

      const isResolved =
        data.status?.toLowerCase().includes('disposed') ||
        data.status?.toLowerCase().includes('acquitted') ||
        data.status?.toLowerCase().includes('dismissed')

      await prisma.case.update({
        where: { id: c.id },
        data: {
          nextHearingDate: data.nextHearingDate ? new Date(data.nextHearingDate) : null,
          lastOrderSummary: data.lastOrderSummary,
          hearingCount: data.hearings?.length ?? 0,
          rawEcourtsData: data as unknown as Prisma.InputJsonValue,
          ...(isResolved && { status: 'ACQUITTED' }),
          updatedAt: new Date(),
        },
      })

      if (isResolved) results.acquitted++
      else results.updated++
    } catch {
      results.failed++
    }
  }

  // Flag cases with hearings in 2 days
  const twoDaysFromNow = new Date()
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
  const dayAfter = new Date(twoDaysFromNow)
  dayAfter.setDate(dayAfter.getDate() + 1)

  const upcomingCases = await prisma.case.findMany({
    where: {
      status: 'ACTIVE',
      nextHearingDate: { gte: twoDaysFromNow, lt: dayAfter },
    },
    select: { id: true },
  })

  // Create pending alert records (picked up by send-alerts cron)
  for (const c of upcomingCases) {
    const existing = await prisma.alert.findFirst({
      where: { caseId: c.id, type: 'HEARING_REMINDER', sentAt: null },
    })
    if (!existing) {
      await prisma.alert.create({
        data: { caseId: c.id, type: 'HEARING_REMINDER' },
      })
    }
  }

  return NextResponse.json({ ...results, upcoming: upcomingCases.length })
}
