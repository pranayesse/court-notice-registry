import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const AlertSchema = z.object({
  caseId: z.string().cuid(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  type: z.enum(['HEARING_REMINDER', 'SIGHTING_ADDED', 'CASE_UPDATED']),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = AlertSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { caseId, email, phone, type } = parsed.data
  if (!email && !phone) {
    return NextResponse.json({ error: 'Email or phone required' }, { status: 400 })
  }

  const alert = await prisma.alert.create({
    data: { caseId, email, phone, type },
  })

  return NextResponse.json(alert, { status: 201 })
}
