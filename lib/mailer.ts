import nodemailer from 'nodemailer'

function getTransport() {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_LOGIN,
      pass: process.env.BREVO_SMTP_KEY,
    },
  })
}

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  await getTransport().sendMail({
    from: `PendingCase.in <${process.env.BREVO_SENDER_EMAIL}>`,
    to,
    subject,
    html,
  })
}
