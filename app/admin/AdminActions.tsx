'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

interface AdminActionsProps {
  type: 'sighting' | 'dispute' | 'case'
  id: string
  caseId?: string
}

export default function AdminActions({ type, id, caseId }: AdminActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function act(action: string) {
    setLoading(action)
    const { data: { session } } = await supabase.auth.getSession()

    if (type === 'sighting') {
      await fetch(`/api/admin/sightings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ action }),
      })
    } else if (type === 'dispute') {
      await fetch(`/api/admin/disputes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ action, caseId }),
      })
    } else if (type === 'case') {
      await fetch(`/api/admin/cases/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ action }),
      })
    }

    setLoading(null)
    setDone(true)
  }

  if (done) return <span className="text-xs text-gray-400">Done</span>

  if (type === 'sighting') {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => act('approve')} disabled={!!loading}>
          {loading === 'approve' ? '…' : 'Approve'}
        </Button>
        <Button size="sm" variant="destructive" onClick={() => act('reject')} disabled={!!loading}>
          {loading === 'reject' ? '…' : 'Reject'}
        </Button>
      </div>
    )
  }

  if (type === 'dispute') {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="destructive" onClick={() => act('remove')} disabled={!!loading}>
          {loading === 'remove' ? '…' : 'Remove case'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => act('keep')} disabled={!!loading}>
          {loading === 'keep' ? '…' : 'Keep'}
        </Button>
      </div>
    )
  }

  return (
    <Button size="sm" variant="destructive" onClick={() => act('archive')} disabled={!!loading}>
      {loading ? '…' : 'Archive'}
    </Button>
  )
}
