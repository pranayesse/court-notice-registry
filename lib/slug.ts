export function generateSlug(accusedName: string, cnrNumber: string): string {
  const namePart = accusedName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)

  const cnrSuffix = cnrNumber.slice(-6).toLowerCase()
  return `${namePart}-${cnrSuffix}`
}
