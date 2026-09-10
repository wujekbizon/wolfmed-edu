export type GmailReportConnection = {
  refreshToken: string
  senderEmail: string
}

export type GmailReportStatus = {
  connected: boolean
  senderEmail: string
}

export type StripeReportEmailRequest = {
  month: string
  fingerprint: string
}
