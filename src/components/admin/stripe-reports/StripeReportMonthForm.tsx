'use client'

import { useActionState } from 'react'
import { selectStripeReportMonth } from '@/actions/stripe-reports'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import FieldError from '@/components/FieldError'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'

export default function StripeReportMonthForm({ month }: { month: string }) {
  const [state, action, pending] = useActionState(selectStripeReportMonth, EMPTY_FORM_STATE)
  const fallback = useToastMessage(state)
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div>
        <Label htmlFor="report-month" label="Miesiąc rozliczeniowy" className="text-zinc-700" />
        <Input id="report-month" name="month" type="month" defaultValue={month}
          className="block rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900" />
        <FieldError name="month" formState={state} />
      </div>
      <Button type="submit" disabled={pending}>{pending ? 'Wczytywanie…' : 'Pokaż raport'}</Button>
      {fallback}
    </form>
  )
}
