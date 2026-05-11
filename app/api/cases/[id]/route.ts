import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase'
import { z } from 'zod'

const UpdateSchema = z.object({
  accusedCity: z.string().optional(),
  accusedEmployer: z.string().optional(),
  accusedAliases: z.array(z.string()).optional(),
  accusedStatement: z.string().max(2000).optional(),
  status: z.enum(['ACTIVE', 'RESOLVED', 'DISMISSED', 'ACQUITTED', 'ARCHIVED']).optional(),
})

async function getAuthorizedCase(caseId: string, userEmail: string) {
  const dbUser = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!dbUser) return null
  return prisma.case.findFirst({ where: { id: caseId, filedById: dbUser.id } })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  )
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getAuthorizedCase(id, user.email!)
  if (!existing) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await prisma.case.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  )
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getAuthorizedCase(id, user.email!)
  if (!existing) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  await prisma.case.update({ where: { id }, data: { status: 'ARCHIVED' } })

  return NextResponse.json({ ok: true })
}
