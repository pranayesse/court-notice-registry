import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase'
import { z } from 'zod'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())

async function requireAdmin(req: NextRequest) {
  const supabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  )
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) return null
  return user
}

const ActionSchema = z.object({
  action: z.enum(['archive', 'activate', 'set_acquitted', 'set_dismissed']),
})

const ACTION_TO_STATUS: Record<string, 'ARCHIVED' | 'ACTIVE' | 'ACQUITTED' | 'DISMISSED'> = {
  archive: 'ARCHIVED',
  activate: 'ACTIVE',
  set_acquitted: 'ACQUITTED',
  set_dismissed: 'DISMISSED',
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = ActionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const status = ACTION_TO_STATUS[parsed.data.action]
  await prisma.case.update({ where: { id }, data: { status } })

  return NextResponse.json({ ok: true })
}
