'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Step = 1 | 2 | 3

interface ECourtPreview {
  cnrNumber: string
  courtName: string
  courtState: string
  courtDistrict: string
  caseType: string
  caseYear: number
  filingDate: string | null
  nextHearingDate: string | null
  hearings: Array<{ date: string; purpose: string }>
}

export default function NewCasePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)

  const [cnr, setCnr] = useState('')
  const [cnrLoading, setCnrLoading] = useState(false)
  const [cnrError, setCnrError] = useState('')
  const [preview, setPreview] = useState<ECourtPreview | null>(null)

  const [accusedName, setAccusedName] = useState('')
  const [aliases, setAliases] = useState('')
  const [city, setCity] = useState('')
  const [employer, setEmployer] = useState('')
  const [filerRole, setFilerRole] = useState('')

  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function lookupCnr(e: React.FormEvent) {
    e.preventDefault()
    setCnrLoading(true)
    setCnrError('')
    try {
      const res = await fetch(`/api/ecourts/lookup?cnr=${encodeURIComponent(cnr)}`)
      setCnrLoading(false)
      if (!res.ok) {
        const data = await res.json()
        setCnrError(data.error ?? 'CNR not found')
      } else {
        const data = await res.json()
        setPreview(data)
        setStep(2)
      }
    } catch {
      setCnrLoading(false)
      setCnrError('Network error. Please try again.')
    }
  }

  async function handleSubmit() {
    setSubmitLoading(true)
    setSubmitError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setSubmitLoading(false)
        setSubmitError('Your session has expired. Please sign in again.')
        return
      }

      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          cnrNumber: cnr,
          accusedName,
          accusedAliases: aliases.split(',').map((a) => a.trim()).filter(Boolean),
          accusedCity: city,
          accusedEmployer: employer,
          filerRole,
        }),
      })

      setSubmitLoading(false)
      if (res.ok) {
        const data = await res.json()
        router.push(`/case/${data.slug}`)
      } else {
        const data = await res.json()
        setSubmitError(data.error ?? 'Failed to file case')
      }
    } catch {
      setSubmitLoading(false)
      setSubmitError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">File a court notice</h1>
      <p className="text-gray-500 text-sm mb-8">
        All case data is verified against the eCourts India portal.
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
                step >= s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </span>
            <span className={step >= s ? 'font-medium' : 'text-gray-400'}>
              {s === 1 ? 'Lookup CNR' : s === 2 ? 'Add details' : 'Confirm'}
            </span>
            {s < 3 && <span className="text-gray-300 mx-1">›</span>}
          </div>
        ))}
      </div>

      {/* Step 1: CNR lookup */}
      {step === 1 && (
        <form onSubmit={lookupCnr} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cnr">CNR Number</Label>
            <Input
              id="cnr"
              value={cnr}
              onChange={(e) => setCnr(e.target.value.toUpperCase())}
              placeholder="e.g. DLHC010001232024"
              className="font-mono"
              required
            />
            <p className="text-xs text-gray-400">
              Find your CNR on the eCourts portal or in court documents.
            </p>
          </div>
          {cnrError && <p className="text-sm text-red-600">{cnrError}</p>}
          <Button type="submit" disabled={cnrLoading}>
            {cnrLoading ? 'Looking up…' : 'Look up case'}
          </Button>
        </form>
      )}

      {/* Step 2: Add accused details */}
      {step === 2 && preview && (
        <div className="space-y-6">
          {/* Preview */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-green-800 flex items-center gap-2">
                <span>✅</span> Case found in eCourts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-gray-700">
              <p><span className="font-medium">Court:</span> {preview.courtName}</p>
              <p><span className="font-medium">Type:</span> {preview.caseType} ({preview.caseYear})</p>
              <p><span className="font-medium">Next hearing:</span> {preview.nextHearingDate ?? 'TBD'}</p>
              <p><span className="font-medium">Hearings:</span> {preview.hearings?.length ?? 0}</p>
            </CardContent>
          </Card>

          <form onSubmit={(e) => { e.preventDefault(); setStep(3) }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Accused / Respondent full name *</Label>
              <Input
                id="name"
                value={accusedName}
                onChange={(e) => setAccusedName(e.target.value)}
                placeholder="Rahul Kumar"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aliases">
                Aliases / alternate names{' '}
                <span className="font-normal text-gray-400">(comma-separated)</span>
              </Label>
              <Input
                id="aliases"
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder="Rahu, R. Kumar"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City / District</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New Delhi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employer">Employer / Organization</Label>
              <Input
                id="employer"
                value={employer}
                onChange={(e) => setEmployer(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Your relationship to this case *</Label>
              <Select value={filerRole} onValueChange={(v) => { if (v) setFilerRole(v) }}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="petitioner">Petitioner / Complainant</SelectItem>
                  <SelectItem value="advocate">Advocate</SelectItem>
                  <SelectItem value="witness">Witness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" disabled={!accusedName || !filerRole}>
                Review & confirm
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && preview && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review your notice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <dl className="grid grid-cols-2 gap-2">
                {[
                  ['CNR', cnr],
                  ['Accused name', accusedName],
                  ['Aliases', aliases || '—'],
                  ['City', city || '—'],
                  ['Employer', employer || '—'],
                  ['Court', preview.courtName],
                  ['Case type', preview.caseType],
                  ['Your role', filerRole],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <dt className="text-gray-400 text-xs uppercase">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="border-t pt-3">
                <p className="text-xs text-gray-500">
                  By publishing this notice, you confirm that the case information is accurate
                  and sourced from the official eCourts India portal (CNR: {cnr}). False
                  filings may result in account suspension.
                </p>
              </div>
            </CardContent>
          </Card>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>
              Edit
            </Button>
            <Button onClick={handleSubmit} disabled={submitLoading} className="bg-red-600 hover:bg-red-700">
              {submitLoading ? 'Publishing…' : 'Publish notice'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
