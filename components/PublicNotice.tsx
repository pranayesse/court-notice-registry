import { Case } from '@prisma/client'

interface PublicNoticeProps {
  caseData: Pick<
    Case,
    | 'accusedName'
    | 'accusedAliases'
    | 'accusedCity'
    | 'accusedEmployer'
    | 'courtName'
    | 'courtState'
    | 'cnrNumber'
    | 'caseType'
    | 'caseYear'
    | 'nextHearingDate'
    | 'filingDate'
    | 'missedHearings'
  >
  filerContact?: string
}

export default function PublicNotice({ caseData, filerContact }: PublicNoticeProps) {
  const {
    accusedName,
    accusedAliases,
    accusedCity,
    accusedEmployer,
    courtName,
    courtState,
    cnrNumber,
    caseType,
    caseYear,
    nextHearingDate,
    filingDate,
    missedHearings,
  } = caseData

  const nextDate = nextHearingDate
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(nextHearingDate))
    : 'To be announced'

  const filedDate = filingDate
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(filingDate))
    : 'Unknown'

  return (
    <div
      id="public-notice"
      className="max-w-2xl mx-auto border-2 border-black p-8 font-serif bg-white print:shadow-none shadow-lg"
    >
      <style>{`@media print { body * { visibility: hidden; } #public-notice, #public-notice * { visibility: visible; } #public-notice { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none; } }`}</style>

      <div className="text-center mb-6">
        <p className="text-xs font-sans uppercase tracking-widest text-gray-500 mb-1">
          PUBLIC LEGAL NOTICE
        </p>
        <h1 className="text-2xl font-bold uppercase border-b-2 border-black pb-2">
          COURT NOTICE REGISTRY
        </h1>
        <p className="text-xs text-gray-500 mt-1">pendingcase.in · CNR: {cnrNumber}</p>
      </div>

      <p className="text-sm leading-relaxed mb-4">
        TAKE NOTICE that{' '}
        <strong>
          {accusedName}
          {accusedAliases.length > 0 ? ` (also known as ${accusedAliases.join(', ')})` : ''}
        </strong>
        {accusedCity ? ` of ${accusedCity}` : ''}
        {accusedEmployer ? `, employed at ${accusedEmployer},` : ','} has a pending{' '}
        <strong>{caseType}</strong> case (Case Year {caseYear}) before the{' '}
        <strong>{courtName}</strong>, {courtState}.
      </p>

      <table className="w-full text-sm border-collapse mb-4">
        <tbody>
          {[
            ['CNR Number', cnrNumber],
            ['Court', `${courtName}, ${courtState}`],
            ['Case Type', caseType],
            ['Filing Date', filedDate],
            ['Next Hearing', nextDate],
            ['Missed Hearings', missedHearings.toString()],
          ].map(([label, value]) => (
            <tr key={label} className="border border-gray-300">
              <td className="px-3 py-1.5 font-semibold bg-gray-50 w-40">{label}</td>
              <td className="px-3 py-1.5">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-gray-600 mb-6 leading-relaxed">
        This notice is published in the public interest based on verified records from the eCourts
        India portal. The information reflects the current status of the case as on the date of
        publication and is subject to change. Any disputes regarding the accuracy of this notice
        may be raised at pendingcase.in/case/{cnrNumber}.
      </p>

      {filerContact && (
        <p className="text-xs text-gray-500">Filer contact: {filerContact}</p>
      )}

      <div className="mt-6 pt-4 border-t border-gray-300 flex justify-between items-center text-xs text-gray-400">
        <span>Published: {new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date())}</span>
        <span>pendingcase.in</span>
      </div>
    </div>
  )
}
