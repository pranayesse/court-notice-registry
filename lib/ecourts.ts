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

function headers() {
  return {
    'x-api-key': KEY,
    Accept: 'application/json',
  }
}

function normalise(raw: Record<string, unknown>): ECourtCase {
  const hearings: ECourtHearing[] = ((raw.hearing_details ?? raw.hearings ?? []) as Record<string, unknown>[]).map(
    (h) => ({
      date: (h.hearing_date ?? h.date ?? '') as string,
      purpose: (h.purpose_of_hearing ?? h.purpose ?? '') as string,
      appeared: h.appeared != null ? Boolean(h.appeared) : null,
      notes: (h.order_text ?? h.notes ?? null) as string | null,
    })
  )

  return {
    cnrNumber: (raw.cnr_number ?? raw.cnrNumber ?? '') as string,
    courtName: (raw.court_name ?? raw.courtName ?? '') as string,
    courtState: (raw.state_name ?? raw.courtState ?? '') as string,
    courtDistrict: (raw.district_name ?? raw.courtDistrict ?? '') as string,
    caseType: (raw.case_type ?? raw.caseType ?? '') as string,
    caseYear: Number(raw.registration_year ?? raw.caseYear ?? new Date().getFullYear()),
    filingDate: (raw.registration_date ?? raw.filingDate ?? null) as string | null,
    nextHearingDate: (raw.next_hearing_date ?? raw.nextHearingDate ?? null) as string | null,
    hearings,
    parties: {
      petitioner: (raw.petitioner_name ?? (raw.parties as Record<string, unknown>)?.petitioner ?? '') as string,
      respondent: (raw.respondent_name ?? (raw.parties as Record<string, unknown>)?.respondent ?? '') as string,
    },
    lastOrderSummary: (raw.order_summary ?? raw.lastOrderSummary ?? null) as string | null,
    status: (raw.case_status ?? raw.status ?? 'ACTIVE') as string,
  }
}

export async function lookupCase(cnr: string): Promise<ECourtCase> {
  const res = await fetch(`${BASE}/caseType/getCaseDetails?cnr_number=${cnr}`, {
    headers: headers(),
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Case not found: ${cnr}`)
  const json = await res.json()
  return normalise(json?.data ?? json)
}

export async function refreshCase(cnr: string): Promise<ECourtCase> {
  const res = await fetch(`${BASE}/caseType/getCaseDetails?cnr_number=${cnr}`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Failed to refresh case: ${cnr}`)
  const json = await res.json()
  return normalise(json?.data ?? json)
}

export async function searchCases(
  query: string,
  filters: Record<string, string>
): Promise<ECourtCase[]> {
  const params = new URLSearchParams({ name: query, ...filters })
  const res = await fetch(`${BASE}/caseType/searchCase?${params}`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Search failed')
  const json = await res.json()
  const list: Record<string, unknown>[] = json?.data ?? json ?? []
  return list.map(normalise)
}
