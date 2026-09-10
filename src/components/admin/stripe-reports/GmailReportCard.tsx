'use client'

import { useActionState } from 'react'
import { sendStripeReportEmail } from '@/actions/stripe-reports'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { GMAIL_REPORT_RECIPIENT } from '@/constants/gmailReports'
import { useToastMessage } from '@/hooks/useToastMessage'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import FieldError from '@/components/FieldError'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import NativeLinkButton from '@/components/ui/NativeLinkButton'
import type { GmailReportStatus } from '@/types/gmailReportTypes'
import type { StripeReport } from '@/types/stripeReportTypes'

export default function GmailReportCard({
  report,
  status,
  oauthStatus,
}: {
  report: StripeReport
  status: GmailReportStatus
  oauthStatus: string
}) {
  const action = sendStripeReportEmail.bind(null, {
    month: report.period.month,
    fingerprint: report.fingerprint,
  })
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE)
  const fallback = useToastMessage(state)
  return (
    <Card className="space-y-3 p-5">
      <h3 className="font-semibold">Wysyłka Gmail</h3>
      {oauthStatus === 'error' && <p role="alert" className="text-red-700">Nie udało się połączyć Gmail.</p>}
      {status.connected ? (
        <>
          <p className="text-sm text-zinc-600">Połączono: {status.senderEmail}</p>
          <form action={formAction} className="flex flex-wrap items-end gap-3">
            <div className="min-w-72">
              <Label htmlFor="gmail-recipient" label="Odbiorca" className="text-zinc-700" />
              <Input id="gmail-recipient" name="recipient" type="email"
                defaultValue={GMAIL_REPORT_RECIPIENT}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900" />
              <FieldError name="recipient" formState={state} />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? 'Wysyłanie…' : 'Wyślij raport i hasło'}
            </Button>
          </form>
          <NativeLinkButton href={`/api/admin/gmail/connect?month=${report.period.month}`} variant="secondary" size="sm">Zmień konto Gmail</NativeLinkButton>
          {fallback}
        </>
      ) : (
        <NativeLinkButton href={`/api/admin/gmail/connect?month=${report.period.month}`}>Połącz Gmail</NativeLinkButton>
      )}
    </Card>
  )
}
