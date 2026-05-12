'use client'

import { useState } from 'react'

export default function AlertForm({ caseId }: { caseId: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, email, type: 'HEARING_REMINDER' }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return <p className="text-sm text-green-700 font-medium">You&apos;ll get an email before the next hearing.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="border rounded px-3 py-2 flex-1 text-sm"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 text-sm font-medium disabled:opacity-60"
      >
        {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {status === 'error' && <p className="text-xs text-red-600 mt-1">Something went wrong. Try again.</p>}
    </form>
  )
}
