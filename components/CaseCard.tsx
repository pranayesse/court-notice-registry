import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CaseStatus } from '@prisma/client'

interface CaseCardProps {
  slug: string
  accusedName: string
  courtName: string
  caseType: string
  nextHearingDate: Date | null
  missedHearings: number
  status: CaseStatus
}

const STATUS_COLORS: Record<CaseStatus, string> = {
  ACTIVE: 'bg-red-100 text-red-800',
  RESOLVED: 'bg-green-100 text-green-800',
  DISMISSED: 'bg-gray-100 text-gray-700',
  ACQUITTED: 'bg-blue-100 text-blue-800',
  ARCHIVED: 'bg-gray-100 text-gray-500',
}

export default function CaseCard({
  slug,
  accusedName,
  courtName,
  caseType,
  nextHearingDate,
  missedHearings,
  status,
}: CaseCardProps) {
  const nextDate = nextHearingDate
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(nextHearingDate))
    : 'Not scheduled'

  return (
    <Link href={`/case/${slug}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight">{accusedName}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[status]}`}>
              {status}
            </span>
          </div>
          <p className="text-sm text-gray-500">{courtName}</p>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-400">Case type: </span>
            <span className="font-medium">{caseType}</span>
          </div>
          <div className="flex items-center gap-2">
            {missedHearings > 3 && (
              <Badge variant="destructive">{missedHearings} missed</Badge>
            )}
            {missedHearings > 0 && missedHearings <= 3 && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                {missedHearings} missed
              </Badge>
            )}
            <span className="text-gray-500">Next: {nextDate}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
