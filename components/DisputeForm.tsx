'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'

interface DisputeFormProps {
  caseId: string
}

const REASONS = [
  { value: 'WRONG_PERSON', label: 'Wrong person — I am not the accused' },
  { value: 'FALSE_CASE', label: 'This case is false or fabricated' },
  { value: 'PRIVATE_INFO', label: 'Contains private/sensitive information' },
  { value: 'OTHER', label: 'Other reason' },
]

export default function DisputeForm({ caseId }: DisputeFormProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Please sign in to file a dispute')
      setLoading(false)
      return
    }

    const res = await fetch('/api/disputes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ caseId, reason, description }),
    })

    setLoading(false)
    if (res.ok) {
      setSuccess(true)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Submission failed')
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
        <p className="font-medium text-blue-800">Dispute filed successfully</p>
        <p className="text-sm text-blue-600 mt-1">
          We will review this within 72 hours as required by IT Act 2000 §79.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Select value={reason} onValueChange={(v) => { if (v) setReason(v) }}>
          <SelectTrigger id="reason">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {REASONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Details <span className="text-gray-400 font-normal">(min 20 characters)</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
          placeholder="Provide details to support your dispute..."
          rows={4}
          required
          minLength={20}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="destructive" disabled={loading || !reason}>
        {loading ? 'Submitting…' : 'File dispute'}
      </Button>
    </form>
  )
}
