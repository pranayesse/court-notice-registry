import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Node runtime required for Prisma
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return new Response('Missing slug', { status: 400 })
  }

  const caseData = await prisma.case.findUnique({
    where: { slug },
    select: {
      accusedName: true,
      courtName: true,
      caseType: true,
      cnrNumber: true,
      nextHearingDate: true,
      missedHearings: true,
      status: true,
    },
  })

  const name = caseData?.accusedName ?? 'Unknown'
  const court = caseData?.courtName ?? '—'
  const cnr = caseData?.cnrNumber ?? '—'
  const caseType = caseData?.caseType ?? '—'
  const nextDate = caseData?.nextHearingDate
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
        new Date(caseData.nextHearingDate)
      )
    : 'TBD'
  const missed = caseData?.missedHearings ?? 0

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Red header banner */}
        <div
          style={{
            background: '#dc2626',
            color: 'white',
            padding: '28px 40px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <span style={{ fontSize: 40 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
              PENDING COURT CASE
            </div>
            <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>pendingcase.in</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ padding: '40px 40px 32px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 52, fontWeight: 800, color: '#111', lineHeight: 1.1, marginBottom: 16 }}>
              {name}
            </div>
            <div style={{ fontSize: 22, color: '#555', marginBottom: 8 }}>{court}</div>
            <div style={{ fontSize: 18, color: '#888' }}>{caseType} · CNR: {cnr}</div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginTop: 32 }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 20px' }}>
              <div style={{ fontSize: 13, color: '#991b1b', fontWeight: 600, marginBottom: 4 }}>NEXT HEARING</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>{nextDate}</div>
            </div>
            {missed > 0 && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '12px 20px' }}>
                <div style={{ fontSize: 13, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>MISSED HEARINGS</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#d97706' }}>{missed}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
