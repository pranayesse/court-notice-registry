import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { lookupCase } from '@/lib/ecourts'
import { generateSlug } from '@/lib/slug'
import { isValidCNR } from '@/lib/validators'
import { createServiceClient } from '@/lib/supabase'
import { Resend } from 'resend'
import { z } from 'zod'

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

const CreateCaseSchema = z.object({
  cnrNumber: z.string().refine(isValidCNR, 'Invalid CNR format'),
  accusedName: z.string().min(2).max(200),
  accusedAliases: z.array(z.string()).default([]),
  accusedCity: z.string().optional(),
  accusedEmployer: z.string().optional(),
  filerRole: z.enum(['petitioner', 'advocate', 'witness']),
})

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  )
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 3 cases/day per user
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })
  if (dbUser) {
    const count = await prisma.case.count({
      where: { filedById: dbUser.id, createdAt: { gte: today } },
    })
    if (count >= 3) {
      return NextResponse.json(
        { error: 'Daily limit reached. Maximum 3 cases per day.' },
        { status: 429 }
      )
    }
  }

  const body = await req.json()
  const parsed = CreateCaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { cnrNumber, accusedName, accusedAliases, accusedCity, accusedEmployer, filerRole } = parsed.data

  let ecourtsData
  try {
    ecourtsData = await lookupCase(cnrNumber)
  } catch {
    return NextResponse.json({ error: 'CNR not found in eCourts database' }, { status: 404 })
  }

  const slug = generateSlug(accusedName, cnrNumber)

  // Upsert user
  const filer = await prisma.user.upsert({
    where: { email: user.email! },
    update: {},
    create: { email: user.email!, name: user.user_metadata?.name },
  })

  const newCase = await prisma.case.create({
    data: {
      cnrNumber,
      slug,
      accusedName,
      accusedAliases,
      accusedCity,
      accusedEmployer,
      filerRole,
      filedById: filer.id,
      isVerified: true,
      courtName: ecourtsData.courtName,
      courtState: ecourtsData.courtState,
      courtDistrict: ecourtsData.courtDistrict,
      caseType: ecourtsData.caseType,
      caseYear: ecourtsData.caseYear,
      filingDate: ecourtsData.filingDate ? new Date(ecourtsData.filingDate) : null,
      nextHearingDate: ecourtsData.nextHearingDate ? new Date(ecourtsData.nextHearingDate) : null,
      hearingCount: ecourtsData.hearings?.length ?? 0,
      rawEcourtsData: ecourtsData as unknown as Prisma.InputJsonValue,
    },
  })

  await getResend().emails.send({
    from: 'Court Notice Registry <noreply@pendingcase.in>',
    to: user.email!,
    subject: `Case filed: ${accusedName} — ${cnrNumber}`,
    html: `<p>Your case notice has been published at <a href="${process.env.NEXT_PUBLIC_BASE_URL}/case/${slug}">pendingcase.in/case/${slug}</a></p>`,
  })

  return NextResponse.json(newCase, { status: 201 })
}

export async function GET(req: NextRequest) {
  const supabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  )
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })
  if (!dbUser) return NextResponse.json([])

  const cases = await prisma.case.findMany({
    where: { filedById: dbUser.id },
    orderBy: { createdAt: 'desc' },
    include: { hearings: true, _count: { select: { sightings: true } } },
  })

  return NextResponse.json(cases)
}
