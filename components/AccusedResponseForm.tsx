'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

interface AccusedResponseFormProps {
  caseId: string
  slug: string
}

export default function AccusedResponseForm({ caseId, slug }: AccusedResponseFormProps) {
  const [email, setEmail] = useState('')
  const [statement, setStatement] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch(`/api/cases/${caseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accusedStatement: statement, _verifyEmail: email }),
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
      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
        <p className="font-medium text-green-800">Statement submitted</p>
        <p className="text-sm text-green-600 mt-1">Your response will appear on this page.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-gray-50">
      <p className="text-sm text-gray-600">
        If you are the person named in this case, you may add a public statement. Your email is used
        for verification only and will not be published.
      </p>

      <div className="space-y-2">
        <Label htmlFor="acc-email">Your email address (verification)</Label>
        <Input
          id="acc-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="acc-statement">
          Your statement <span className="text-gray-400 font-normal">({statement.length}/2000)</span>
        </Label>
        <Textarea
          id="acc-statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value.slice(0, 2000))}
          placeholder="Write your response to this listing..."
          rows={5}
          required
          minLength={10}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting…' : 'Submit statement'}
      </Button>
    </form>
  )
}
