import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  )
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sighting = await prisma.sighting.findUnique({ where: { id } })
  if (!sighting || sighting.isRemoved || !sighting.isApproved) {
    return NextResponse.json({ error: 'Sighting not found' }, { status: 404 })
  }

  const updated = await prisma.sighting.update({
    where: { id },
    data: { upvotes: { increment: 1 } },
  })

  return NextResponse.json({ upvotes: updated.upvotes })
}
