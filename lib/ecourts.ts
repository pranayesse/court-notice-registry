const BASE = process.env.ECOURTS_BASE_URL
const KEY = process.env.ECOURTS_API_KEY

export interface ECourtCase {
  cnrNumber: string
  courtName: string
  courtState: string
  courtDistrict: string
  caseType: string
  caseYear: number
  filingDate: string | null
  nextHearingDate: string | null
  hearings: ECourtHearing[]
  parties: { petitioner: string; respondent: string }
  lastOrderSummary: string | null
  status: string
}

export interface ECourtHearing {
  date: string
  purpose: string
  appeared: boolean | null
  notes: string | null
}

export async function lookupCase(cnr: string): Promise<ECourtCase> {
  const res = await fetch(`${BASE}/case/${cnr}`, {
    headers: { Authorization: `Bearer ${KEY}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Case not found: ${cnr}`)
  return res.json()
}

export async function refreshCase(cnr: string): Promise<ECourtCase> {
  const res = await fetch(`${BASE}/case/refresh`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cnr }),
  })
  if (!res.ok) throw new Error(`Failed to refresh case: ${cnr}`)
  return res.json()
}

export async function searchCases(
  query: string,
  filters: Record<string, string>
): Promise<ECourtCase[]> {
  const params = new URLSearchParams({ q: query, ...filters })
  const res = await fetch(`${BASE}/case/search?${params}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  })
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}
