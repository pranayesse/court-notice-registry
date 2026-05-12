import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mailer'
import twilio from 'twilio'

function getTwilio() { return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) }

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pendingAlerts = await prisma.alert.findMany({
    where: { sentAt: null },
    include: {
      case: {
        select: {
          accusedName: true,
          courtName: true,
          nextHearingDate: true,
          slug: true,
          cnrNumber: true,
        },
      },
    },
    take: 100,
  })

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pendingcase.in'
  const results = { sent: 0, failed: 0 }

  for (const alert of pendingAlerts) {
    const { case: c } = alert
    const nextDate = c.nextHearingDate
      ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(c.nextHearingDate))
      : 'TBD'

    const subject = `Hearing reminder: ${c.accusedName} — ${nextDate}`
    const body = `Hearing for ${c.accusedName} in ${c.courtName} is scheduled on ${nextDate}.\n\nView case: ${base}/case/${c.slug}`

    try {
      if (alert.email) {
        await sendMail({
          to: alert.email,
          subject,
          html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
        })
      }

      if (alert.phone) {
        await getTwilio().messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
          to: `whatsapp:${alert.phone}`,
          body: `⚠️ ${body}`,
        })
      }

      await prisma.alert.update({
        where: { id: alert.id },
        data: { sentAt: new Date() },
      })
      results.sent++
    } catch {
      results.failed++
    }
  }

  return NextResponse.json(results)
}
