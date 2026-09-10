import { randomBytes } from 'node:crypto'
import { encodeMimeBase64 } from './encodeMimeBase64'

export function buildGmailPdfMessage(
  to: string,
  subject: string,
  body: string,
  html: string,
  filename: string,
  pdf: Buffer,
  logo: Buffer
): string {
  const mixed = `mixed_${randomBytes(16).toString('hex')}`
  const related = `related_${randomBytes(16).toString('hex')}`
  const alternative = `alternative_${randomBytes(16).toString('hex')}`
  const encodedSubject = Buffer.from(subject).toString('base64')
  const encodedBody = encodeMimeBase64(body)
  const encodedHtml = encodeMimeBase64(html)
  const encodedPdf = encodeMimeBase64(pdf)
  const encodedLogo = encodeMimeBase64(logo)
  return Buffer.from([
    `To: ${to}`,
    `Subject: =?UTF-8?B?${encodedSubject}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${mixed}"`,
    '',
    `--${mixed}`,
    `Content-Type: multipart/related; boundary="${related}"`,
    '',
    `--${related}`,
    `Content-Type: multipart/alternative; boundary="${alternative}"`,
    '',
    `--${alternative}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodedBody,
    `--${alternative}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodedHtml,
    `--${alternative}--`,
    `--${related}`,
    'Content-Type: image/png; name="wolfmed-logo.png"',
    'Content-Transfer-Encoding: base64',
    'Content-ID: <wolfmed-logo>',
    'Content-Disposition: inline; filename="wolfmed-logo.png"',
    '',
    encodedLogo,
    `--${related}--`,
    `--${mixed}`,
    'Content-Type: application/pdf',
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${filename}"`,
    '',
    encodedPdf,
    `--${mixed}--`,
  ].join('\r\n')).toString('base64url')
}
