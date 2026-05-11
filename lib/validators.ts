const PHONE_RE = /[6-9]\d{9}/
const AADHAAR_RE = /\d{4}[\s-]\d{4}[\s-]\d{4}/
const PAN_RE = /[A-Z]{5}\d{4}[A-Z]/
const GPS_RE = /\d{1,3}\.\d+,\s*\d{1,3}\.\d+/
const ADDRESS_KEYWORDS = ['flat no', 'house no', 'plot no', 'door no', 'survey no']

export type BlocklistResult = { ok: true } | { ok: false; reason: string }

export function checkBlocklist(text: string): BlocklistResult {
  const lower = text.toLowerCase()

  if (PHONE_RE.test(text))
    return { ok: false, reason: 'Phone numbers are not allowed in this field.' }
  if (AADHAAR_RE.test(text))
    return { ok: false, reason: 'Aadhaar numbers are not allowed.' }
  if (PAN_RE.test(text))
    return { ok: false, reason: 'PAN numbers are not allowed.' }
  if (GPS_RE.test(text))
    return { ok: false, reason: 'GPS coordinates are not allowed.' }
  if (ADDRESS_KEYWORDS.some((kw) => lower.includes(kw)))
    return { ok: false, reason: 'Home address details are not allowed in sightings.' }

  return { ok: true }
}

export function isValidHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function isValidCNR(cnr: string): boolean {
  // CNR format: STATECODE + COURT_CODE + CASE_NUMBER + YEAR (16 chars)
  return /^[A-Z]{4}\d{12}$/.test(cnr.trim().toUpperCase())
}
