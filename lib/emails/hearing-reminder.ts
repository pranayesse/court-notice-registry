export function hearingReminderHtml({
  accusedName,
  courtName,
  nextDate,
  caseUrl,
  cnrNumber,
}: {
  accusedName: string
  courtName: string
  nextDate: string
  caseUrl: string
  cnrNumber: string
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#dc2626;padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">⚖ PendingCase.in</p>
              <p style="margin:4px 0 0;color:#fca5a5;font-size:13px;">Court Hearing Reminder</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Hearing tomorrow</p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">This is a reminder for the scheduled court hearing below.</p>

              <!-- Case card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;color:#991b1b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Accused / Respondent</p>
                    <p style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700;">${accusedName}</p>

                    <p style="margin:0 0 4px;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Court</p>
                    <p style="margin:0 0 16px;color:#111827;font-size:14px;">${courtName}</p>

                    <p style="margin:0 0 4px;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Hearing Date</p>
                    <p style="margin:0 0 16px;color:#d97706;font-size:18px;font-weight:700;">${nextDate}</p>

                    <p style="margin:0 0 4px;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">CNR Number</p>
                    <p style="margin:0;color:#374151;font-size:13px;font-family:monospace;">${cnrNumber}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#dc2626;border-radius:8px;">
                    <a href="${caseUrl}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">View case details →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">You received this because you subscribed to hearing alerts on PendingCase.in. Case data is sourced from eCourts India.</p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">Grievance Officer: pranay.esse@protonmail.com — response within 72 hours.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
