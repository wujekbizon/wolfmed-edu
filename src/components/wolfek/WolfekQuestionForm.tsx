'use client'

import { useId, useRef } from 'react'
import { ArrowUp } from 'lucide-react'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'
import FieldError from '@/components/FieldError'
import FormError from '@/components/FormError'
import { useToastMessage } from '@/hooks/useToastMessage'
import type { WolfekQuestionProps, WolfekQuestionState } from '@/types/wolfekResponseTypes'

export default function WolfekQuestionForm({ route, practice, recentMessages, state, pending, action, onInteraction }: WolfekQuestionProps & {
  state: WolfekQuestionState; pending: boolean; action: (data: FormData) => void; onInteraction?: () => void
}) {
  const generatedId = useId()
  const id = route.startsWith('panel.') ? 'panel-wolfek-question' : generatedId
  const submission = useRef<HTMLInputElement>(null)
  const toast = useToastMessage(state)
  return <form action={action} onSubmit={() => {
    if (submission.current) submission.current.value = crypto.randomUUID()
    onInteraction?.()
  }}>
    <Input type="hidden" name="route" value={route} />
    <Input type="hidden" name="origin" value="typed" />
    <Input type="hidden" name="practice" value={practice ? JSON.stringify(practice) : ''} />
    {recentMessages && <Input type="hidden" name="recentMessages" value={JSON.stringify(recentMessages)} />}
    <Input type="hidden" name="submissionId" inputRef={submission} defaultValue="" />
    <Label htmlFor={id} label="Zadaj własne pytanie"
      className="panel-wolfek-topics-label wolfek-custom-question-label" />
    <div className="panel-wolfek-question-row">
      <Input id={id} name="question" type="text" className="panel-wolfek-input"
        placeholder="O co chcesz zapytać?" disabled={pending} />
      <Button type="submit" size="sm" shape="pill" variant="secondary"
        className="panel-wolfek-send" disabled={pending} aria-label="Wyślij pytanie"><ArrowUp size={19} /></Button>
    </div>
    <FieldError name="question" formState={state} />
    <FormError formState={{ ...state, fieldErrors: { ...state.fieldErrors, question: undefined } }} />{toast}
  </form>
}
