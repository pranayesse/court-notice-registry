import { Hearing } from '@prisma/client'

interface HearingTimelineProps {
  hearings: Hearing[]
}

export default function HearingTimeline({ hearings }: HearingTimelineProps) {
  if (hearings.length === 0) {
    return <p className="text-gray-500 text-sm">No hearing records found.</p>
  }

  const sorted = [...hearings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const now = new Date()

  return (
    <ol className="relative border-l border-gray-200 space-y-6 ml-3">
      {sorted.map((hearing) => {
        const date = new Date(hearing.date)
        const isFuture = date > now
        const dotColor = isFuture
          ? 'bg-gray-300'
          : hearing.appeared === true
          ? 'bg-green-500'
          : hearing.appeared === false
          ? 'bg-red-500'
          : 'bg-yellow-400'

        const label = isFuture
          ? 'Upcoming'
          : hearing.appeared === true
          ? 'Appeared'
          : hearing.appeared === false
          ? 'Missed'
          : 'Unknown'

        return (
          <li key={hearing.id} className="ml-6">
            <span
              className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${dotColor} ring-4 ring-white`}
            />
            <div className="flex items-center gap-3 mb-1">
              <time className="text-sm font-semibold text-gray-700">
                {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date)}
              </time>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isFuture
                    ? 'bg-gray-100 text-gray-600'
                    : hearing.appeared === true
                    ? 'bg-green-100 text-green-700'
                    : hearing.appeared === false
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {label}
              </span>
            </div>
            {hearing.purpose && (
              <p className="text-sm text-gray-600">{hearing.purpose}</p>
            )}
            {hearing.notes && (
              <p className="text-xs text-gray-400 mt-0.5">{hearing.notes}</p>
            )}
          </li>
        )
      })}
    </ol>
  )
}
