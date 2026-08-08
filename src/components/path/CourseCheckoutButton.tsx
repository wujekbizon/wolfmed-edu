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
  accessTier,
  alreadyOwned = false
}: {
  courseSlug: string
  priceId: string
  accessTier: string
  alreadyOwned?: boolean
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
        label={alreadyOwned ? 'Masz już dostęp' : 'Uzyskaj dostęp do kursu'}
        loading='Przekierowywanie...'
        disabled={alreadyOwned}
        className='h-13 text-base font-semibold'
      />
    </form>
  )
}
