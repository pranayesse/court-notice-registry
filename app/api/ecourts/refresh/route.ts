import { NextRequest, NextResponse } from 'next/server'
import { refreshCase } from '@/lib/ecourts'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { isValidCNR } from '@/lib/validators'
import { getUserFromToken } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const user = getUserFromToken(req.headers.get('Authorization')?.replace('Bearer ', '') ?? '')
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { cnr } = await req.json()
  if (!cnr || !isValidCNR(cnr)) {
    return NextResponse.json({ error: 'Invalid CNR' }, { status: 400 })
  }

  try {
    const data = await refreshCase(cnr)
    const updated = await prisma.case.update({
      where: { cnrNumber: cnr },
      data: {
        nextHearingDate: data.nextHearingDate ? new Date(data.nextHearingDate) : null,
        lastOrderSummary: data.lastOrderSummary,
        rawEcourtsData: data as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    })
    return NextResponse.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Refresh failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
