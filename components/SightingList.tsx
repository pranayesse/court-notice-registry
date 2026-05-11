'use client'

import { useState } from 'react'
import { Sighting } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { ExternalLink, ThumbsUp } from 'lucide-react'

interface SightingListProps {
  sightings: Sighting[]
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  news: 'News',
  business_registry: 'Business Registry',
  court_website: 'Court Website',
  other: 'Other',
}

export default function SightingList({ sightings }: SightingListProps) {
  const [votes, setVotes] = useState<Record<string, number>>(
    Object.fromEntries(sightings.map((s) => [s.id, s.upvotes]))
  )
  const [voted, setVoted] = useState<Set<string>>(new Set())

  async function upvote(id: string) {
    if (voted.has(id)) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return alert('Sign in to upvote')

    const res = await fetch(`/api/sightings/${id}/upvote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.ok) {
      const { upvotes } = await res.json()
      setVotes((v) => ({ ...v, [id]: upvotes }))
      setVoted((s) => new Set(s).add(id))
    }
  }

  if (sightings.length === 0) {
    return <p className="text-gray-500 text-sm">No public sightings yet.</p>
  }

  return (
    <ul className="space-y-4">
      {sightings.map((s) => (
        <li key={s.id} className="border rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">{s.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                {s.platform && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded">
                    {PLATFORM_LABELS[s.platform] ?? s.platform}
                  </span>
                )}
                <a
                  href={s.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  Source <ExternalLink size={12} />
                </a>
                <span>{new Intl.DateTimeFormat('en-IN', { dateStyle: 'short' }).format(new Date(s.createdAt))}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => upvote(s.id)}
              disabled={voted.has(s.id)}
              className="shrink-0 gap-1"
            >
              <ThumbsUp size={14} />
              {votes[s.id] ?? s.upvotes}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
