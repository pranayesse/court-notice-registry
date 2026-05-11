const BASE = 'https://webapi.ecourtsindia.com'
const KEY = process.env.ECOURTS_API_KEY ?? ''

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

function authHeader() {
  return { Authorization: `Bearer ${KEY}`, Accept: 'application/json' }
}

function normalise(raw: Record<string, unknown>): ECourtCase {
  const c = (raw.courtCaseData ?? raw) as Record<string, unknown>
  const desc = raw.descriptions as Record<string, unknown> | undefined
  const enumLookup = (desc?.enumLookup as Record<string, Record<string, string>> | undefined) ?? {}

  // Resolve caseType code → full name (e.g. "MJC" → "Misc Judicial Cases")
  const caseTypeCode = c.caseType as string ?? ''
  const caseTypeFull = enumLookup.caseType?.[caseTypeCode] ?? caseTypeCode

  const hearingHistory = (c.historyOfCaseHearings as Record<string, unknown>[]) ?? []
  const hearings: ECourtHearing[] = hearingHistory.map((h) => ({
    date: (h.hearingDate ?? h.businessOnDate ?? '') as string,
    purpose: (h.purposeOfListing ?? '') as string,
    appeared: null,
    notes: null,
  }))

  const petitioners = c.petitioners as string[] ?? []
  const respondents = c.respondents as string[] ?? []

  return {
    cnrNumber: (c.cnr ?? '') as string,
    courtName: (c.courtName ?? '') as string,
    courtState: (c.state ?? '') as string,
    courtDistrict: (c.district ?? '') as string,
    caseType: caseTypeFull,
    caseYear: Number(c.cnrYear ?? new Date().getFullYear()),
    filingDate: (c.filingDate ?? null) as string | null,
    nextHearingDate: (c.nextHearingDate ?? null) as string | null,
    hearings,
    parties: {
      petitioner: petitioners.join(', '),
      respondent: respondents.join(', '),
    },
    lastOrderSummary: null,
    status: (c.caseStatus ?? 'PENDING') as string,
  }
}

export async function lookupCase(cnr: string): Promise<ECourtCase> {
  const res = await fetch(`${BASE}/api/partner/case/${cnr}`, {
    headers: authHeader(),
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message ?? `Case not found: ${cnr}`)
  }
  const json = await res.json()
  return normalise(json.data)
}

export async function refreshCase(cnr: string): Promise<ECourtCase> {
  // Queue a re-scrape from eCourts source
  await fetch(`${BASE}/api/partner/case/${cnr}/refresh`, {
    method: 'POST',
    headers: authHeader(),
  })
  // Fetch current data (refresh is async; caller can retry later for latest)
  return lookupCase(cnr)
}

export async function searchCases(
  query: string,
  filters: Record<string, string>
): Promise<ECourtCase[]> {
  const params = new URLSearchParams({ query, ...filters })
  const res = await fetch(`${BASE}/api/partner/search?${params}`, {
    headers: authHeader(),
  })
  if (!res.ok) throw new Error('Search failed')
  const json = await res.json()
  const results = (json.data?.results ?? []) as Record<string, unknown>[]
  return results.map((r) => normalise({ courtCaseData: r }))
}
