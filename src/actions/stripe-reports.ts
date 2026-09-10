'use server'

import { redirect } from 'next/navigation'
import { ensureAdmin } from '@/helpers/ensureAdmin'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { StripeReportMonthSchema } from '@/server/schema'
import { SendStripeReportEmailSchema } from '@/server/schema'
import { checkRateLimit } from '@/lib/rateLimit'
import { getGmailReportConnection } from '@/server/gmail-reports/getGmailReportConnection'
import { getStripeReport } from '@/server/stripe-reports/getStripeReport'
import { sendStripeReportEmails } from '@/server/gmail-reports/sendStripeReportEmails'
import type { FormState } from '@/types/actionTypes'
import type { StripeReportEmailRequest } from '@/types/gmailReportTypes'

export async function selectStripeReportMonth(
  _state: FormState, form: FormData
): Promise<FormState> {
  try {
    await ensureAdmin()
  } catch {
    return toFormState('ERROR', 'Brak dostępu.')
  }
  const parsed = StripeReportMonthSchema.safeParse({ month: form.get('month') })
  if (!parsed.success) return fromErrorToFormState(parsed.error)
  redirect(`/admin/stripe-reports?month=${parsed.data.month}`)
}

export async function sendStripeReportEmail(
  request: StripeReportEmailRequest,
  _state: FormState,
  form: FormData
): Promise<FormState> {
  let userId: string
  try {
    userId = await ensureAdmin()
  } catch {
    return toFormState('ERROR', 'Brak dostępu.')
  }
  const parsed = SendStripeReportEmailSchema.safeParse({
    ...request,
    recipient: form.get('recipient'),
  })
  if (!parsed.success) return fromErrorToFormState(parsed.error)
  if (!(await checkRateLimit(userId, 'gmail:send')).success) {
    return toFormState('ERROR', 'Limit wysyłki osiągnięty. Spróbuj później.')
  }
  const connection = await getGmailReportConnection()
  if (!connection) return toFormState('ERROR', 'Najpierw połącz konto Gmail.')
  try {
    const report = await getStripeReport(parsed.data.month)
    if (report.fingerprint !== parsed.data.fingerprint) {
      return toFormState('ERROR', 'Dane zmieniły się. Odśwież raport przed wysłaniem.')
    }
    await sendStripeReportEmails(connection, parsed.data.recipient, report)
    return toFormState('SUCCESS', `Raport i hasło wysłano do ${parsed.data.recipient}.`)
  } catch {
    return toFormState('ERROR', 'Nie udało się wysłać obu wiadomości. Sprawdź folder Wysłane.')
  }
}
