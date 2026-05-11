import { NextRequest, NextResponse } from 'next/server'
import { lookupCase } from '@/lib/ecourts'
import { isValidCNR } from '@/lib/validators'

// In-memory 60s cache to avoid duplicate eCourts API hits
const cache = new Map<string, { data: unknown; expiresAt: number }>()

export async function GET(req: NextRequest) {
  const cnr = req.nextUrl.searchParams.get('cnr')?.trim().toUpperCase()

  if (!cnr) {
    return NextResponse.json({ error: 'CNR number is required' }, { status: 400 })
  }
  if (!isValidCNR(cnr)) {
    return NextResponse.json({ error: 'Invalid CNR format' }, { status: 400 })
  }

  const cached = cache.get(cnr)
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data)
  }

  try {
    const data = await lookupCase(cnr)
    cache.set(cnr, { data, expiresAt: Date.now() + 60_000 })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch case'
    return NextResponse.json({ error: message }, { status: 404 })
  }
}
