import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase'
import { checkBlocklist, isValidHttpsUrl } from '@/lib/validators'
import { z } from 'zod'

const SightingSchema = z.object({
  caseId: z.string().cuid(),
  sourceUrl: z.string().url(),
  description: z.string().min(10).max(300),
  platform: z.enum(['linkedin', 'news', 'business_registry', 'court_website', 'other']).optional(),
})

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  )
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = SightingSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { caseId, sourceUrl, description, platform } = parsed.data

  if (!isValidHttpsUrl(sourceUrl)) {
    return NextResponse.json({ error: 'Source URL must be a valid HTTPS URL' }, { status: 400 })
  }

  const urlCheck = checkBlocklist(sourceUrl)
  if (!urlCheck.ok) return NextResponse.json({ error: urlCheck.reason }, { status: 400 })

  const descCheck = checkBlocklist(description)
  if (!descCheck.ok) return NextResponse.json({ error: descCheck.reason }, { status: 400 })

  // Rate limit: 5 sightings/day per user
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const count = await prisma.sighting.count({
    where: { submittedById: dbUser.id, createdAt: { gte: today } },
  })
  if (count >= 5) {
    return NextResponse.json({ error: 'Daily sighting limit (5) reached' }, { status: 429 })
  }

  const sighting = await prisma.sighting.create({
    data: { caseId, sourceUrl, description, platform, submittedById: dbUser.id },
  })

  return NextResponse.json(sighting, { status: 201 })
}
