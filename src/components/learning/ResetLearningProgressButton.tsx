'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FormError from '@/components/FormError'
import { resetPracticeAction } from '@/actions/learning-reset'
import { EMPTY_PRACTICE_STATE } from '@/constants/learningPractice'
import { useToastMessage } from '@/hooks/useToastMessage'
import { usePracticeSelectionStore } from '@/store/usePracticeSelectionStore'
import type { ResetLearningProgressProps } from '@/types/learningUiTypes'

export default function ResetLearningProgressButton({ userId, category, session, onReset }: ResetLearningProgressProps) {
  const [confirming, setConfirming] = useState(false)
  const [state, action, pending] = useActionState(resetPracticeAction, EMPTY_PRACTICE_STATE)
  const eventInput = useRef<HTMLInputElement>(null)
  const onResetRef = useRef(onReset)
  const clearCategory = usePracticeSelectionStore((store) => store.clearCategory)
  const toast = useToastMessage(state)
  useEffect(() => { onResetRef.current = onReset }, [onReset])
  useEffect(() => {
    if (state.status === 'SUCCESS' && state.session) {
      clearCategory(userId, category)
      onResetRef.current(state.session)
      setConfirming(false)
    }
  }, [state, clearCategory, userId, category])
  const hasProgress = session.cards.some((card) => card.attempts > 0 || card.hintOpened || card.resolved)
  if (!hasProgress) return null
  return <div className="learning-reset">
    {!confirming ? <Button variant="ghost" size="md" onClick={() => setConfirming(true)}>
      <RotateCcw size={14} />Resetuj postęp
    </Button> : <form action={action} className="learning-reset-confirm" onSubmit={() => {
      if (eventInput.current && !eventInput.current.value) eventInput.current.value = crypto.randomUUID()
    }}>
      <Input type="hidden" name="category" value={category} />
      <Input type="hidden" name="sessionId" value={session.id} />
      <Input type="hidden" name="version" value={session.version} />
      <Input type="hidden" name="eventId" inputRef={eventInput} />
      <span>Wyczyścić zapisane odpowiedzi? Ponowne próby pozostaną oznaczone jako widziane.</span>
      <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>Anuluj</Button>
      <Button type="submit" size="sm" disabled={pending}>{pending ? 'Resetowanie…' : 'Potwierdź'}</Button>
      <FormError formState={state} />
      {toast}
    </form>}
  </div>
}
