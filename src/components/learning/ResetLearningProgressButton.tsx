'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Ellipsis, RotateCcw } from 'lucide-react'
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
  const menuRef = useRef<HTMLDetailsElement>(null)
  const eventInput = useRef<HTMLInputElement>(null)
  const onResetRef = useRef(onReset)
  const clearCategory = usePracticeSelectionStore((store) => store.clearCategory)
  const toast = useToastMessage(state)
  useEffect(() => { onResetRef.current = onReset }, [onReset])
  useEffect(() => {
    if (state.status === 'SUCCESS' && state.session) {
      clearCategory(userId, category)
      onResetRef.current(state.session)
      menuRef.current?.removeAttribute('open')
      setConfirming(false)
    }
  }, [state, clearCategory, userId, category])
  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        menuRef.current.open = false
        setConfirming(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !menuRef.current?.open) return
      menuRef.current.open = false
      menuRef.current.querySelector('summary')?.focus()
      setConfirming(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])
  const hasProgress = session.cards.some((card) => card.attempts > 0 || card.hintOpened || card.resolved)
  if (!hasProgress) return null
  return <details ref={menuRef} className="learning-actions"
    onToggle={(event) => { if (!event.currentTarget.open) setConfirming(false) }}>
    <summary className="learning-actions-trigger" aria-label="Opcje nauki" title="Opcje nauki">
      <Ellipsis size={20} aria-hidden="true" />
    </summary>
    <div className="learning-actions-panel">
      {!confirming ? <Button variant="ghost" size="sm" className="learning-actions-item"
        onClick={() => setConfirming(true)}>
        <RotateCcw size={15} aria-hidden="true" />Resetuj postęp
      </Button> : <form action={action} className="learning-reset-confirm" onSubmit={() => {
        if (eventInput.current && !eventInput.current.value) eventInput.current.value = crypto.randomUUID()
      }}>
        <Input type="hidden" name="category" value={category} />
        <Input type="hidden" name="sessionId" value={session.id} />
        <Input type="hidden" name="version" value={session.version} />
        <Input type="hidden" name="eventId" inputRef={eventInput} />
        <p>Wyczyścić odpowiedzi i opanowanie? Historia wyświetlenia kart pozostanie zapisana.</p>
        <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>Anuluj</Button>
        <Button type="submit" size="sm" disabled={pending}>{pending ? 'Resetowanie…' : 'Potwierdź'}</Button>
        <FormError formState={state} />
        {toast}
      </form>}
    </div>
  </details>
}
