'use client'

import { useActionState } from 'react'
import { createCheckoutSession } from '@/actions/stripe'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import SubmitButton from '@/components/SubmitButton'

// The same server action the plan cards post to, so the hero sells the course
// rather than pointing at something that does.
export default function CourseCheckoutButton({
  courseSlug,
  priceId,
  accessTier
}: {
  courseSlug: string
  priceId: string
  accessTier: string
}) {
  const [state, action] = useActionState(createCheckoutSession, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <form action={action} className='w-full max-w-xs'>
      {noScriptFallback}
      <input type='hidden' name='courseSlug' value={courseSlug} />
      <input type='hidden' name='accessTier' value={accessTier} />
      <input type='hidden' name='priceId' value={priceId} />
      <SubmitButton
        label='Uzyskaj dostęp do kursu'
        loading='Przekierowywanie...'
        variant='cta'
        size='lg'
        shape='pill'
      />
    </form>
  )
}
