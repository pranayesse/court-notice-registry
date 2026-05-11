'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface SightingFormProps {
  caseId: string
  onSuccess?: () => void
}

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'news', label: 'News Article' },
  { value: 'business_registry', label: 'Business Registry' },
  { value: 'court_website', label: 'Court Website' },
  { value: 'other', label: 'Other' },
]

export default function SightingForm({ caseId, onSuccess }: SightingFormProps) {
  const [sourceUrl, setSourceUrl] = useState('')
  const [description, setDescription] = useState('')
  const [platform, setPlatform] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [urlError, setUrlError] = useState('')

  function validateUrl(url: string) {
    if (!url) return
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'https:') {
        setUrlError('URL must start with https://')
      } else {
        setUrlError('')
      }
    } catch {
      setUrlError('Please enter a valid URL')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (urlError) return

    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Please sign in to submit a sighting')
      setLoading(false)
      return
    }

    const res = await fetch('/api/sightings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ caseId, sourceUrl, description, platform }),
    })

    setLoading(false)
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Submission failed')
    } else {
      setSuccess(true)
      onSuccess?.()
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
        <p className="font-medium text-green-800">Sighting submitted for review</p>
        <p className="text-sm text-green-600 mt-1">
          It will appear on the page once approved by our moderation team.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sourceUrl">Source URL (required)</Label>
        <Input
          id="sourceUrl"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          onBlur={(e) => validateUrl(e.target.value)}
          placeholder="https://www.linkedin.com/in/..."
          required
        />
        {urlError && <p className="text-xs text-red-600">{urlError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform">Platform</Label>
        <Select value={platform} onValueChange={(v) => { if (v) setPlatform(v) }}>
          <SelectTrigger id="platform">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description
          <span className="text-gray-400 ml-1 font-normal">({description.length}/300)</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 300))}
          placeholder="Describe what you found at this URL..."
          rows={3}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading || !!urlError}>
        {loading ? 'Submitting…' : 'Submit sighting'}
      </Button>
    </form>
  )
}
