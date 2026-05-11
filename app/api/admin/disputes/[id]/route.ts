import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())

async function requireAdmin(req: NextRequest) {
  const supabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  )
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) return null
  return user
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, caseId } = await req.json()

  if (action === 'remove') {
    await Promise.all([
      prisma.dispute.update({
        where: { id },
        data: { status: 'RESOLVED_REMOVED', resolvedAt: new Date() },
      }),
      caseId && prisma.case.update({ where: { id: caseId }, data: { status: 'ARCHIVED' } }),
    ])
  } else if (action === 'keep') {
    await prisma.dispute.update({
      where: { id },
      data: { status: 'RESOLVED_KEPT', resolvedAt: new Date() },
    })
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
