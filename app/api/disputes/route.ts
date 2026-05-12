import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from "@/lib/supabase"
import { z } from 'zod'

const DisputeSchema = z.object({
  caseId: z.string().cuid(),
  reason: z.enum(['WRONG_PERSON', 'FALSE_CASE', 'PRIVATE_INFO', 'OTHER']),
  description: z.string().min(20).max(1000),
})

export async function POST(req: NextRequest) {
  const user = getUserFromToken(req.headers.get('Authorization')?.replace('Bearer ', '') ?? '')
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = DisputeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { caseId, reason, description } = parsed.data

  const dbUser = await prisma.user.upsert({
    where: { email: user.email! },
    update: {},
    create: { email: user.email! },
  })

  const dispute = await prisma.dispute.create({
    data: { caseId, reason, description, filedById: dbUser.id },
  })

  // Auto-hide sightings for private info disputes pending review
  if (reason === 'PRIVATE_INFO') {
    await prisma.sighting.updateMany({
      where: { caseId, isApproved: true },
      data: { isApproved: false },
    })
  }

  return NextResponse.json(dispute, { status: 201 })
}
