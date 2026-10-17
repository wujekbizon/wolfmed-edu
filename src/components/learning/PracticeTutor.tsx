'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { askRagQuestion } from '@/actions/rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { RAG_RECENT_CONTEXT_MESSAGES, RAG_RECENT_CONTEXT_TEXT_LENGTH } from '@/constants/ragCell'
import { useToastMessage } from '@/hooks/useToastMessage'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import FieldError from '@/components/FieldError'
import FormError from '@/components/FormError'
import RagResponse from '@/components/cells/RagResponse'
import type { PracticeTutorProps } from '@/types/learningUiTypes'
import type { TutorContextMessage } from '@/types/memoryTypes'
import type { SourceRef } from '@/types/retrievalTypes'

export default function PracticeTutor({ reference, category, onClose }: PracticeTutorProps) {
  const [state, action, pending] = useActionState(askRagQuestion, EMPTY_FORM_STATE)
  const [messages, setMessages] = useState<TutorContextMessage[]>([])
  const questionInput = useRef<HTMLInputElement>(null)
  const submitted = useRef('')
  const previousFocus = useRef<HTMLElement | null>(null)
  const toastFallback = useToastMessage(state)
  const answer = typeof state.values?.answer === 'string' ? state.values.answer : ''
  const { questionNumber, ...contextReference } = reference
  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement
    questionInput.current?.focus()
    return () => {
      if (previousFocus.current?.isConnected) previousFocus.current.focus()
      else document.getElementById('practice-question-heading')?.focus()
    }
  }, [])
  useEffect(() => {
    if (state.status !== 'SUCCESS' || !answer) return
    setMessages((current) => [...current,
      { role: 'user' as const, text: submitted.current.slice(0, RAG_RECENT_CONTEXT_TEXT_LENGTH) },
      { role: 'assistant' as const, text: answer.slice(0, RAG_RECENT_CONTEXT_TEXT_LENGTH) },
    ].slice(-RAG_RECENT_CONTEXT_MESSAGES))
  }, [state, answer])
  return <Card className="space-y-4 p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-semibold">Pytanie {questionNumber} · {category.replace(/-/g, ' ')}</h2>
      <Button variant="ghost" size="lg" onClick={onClose}>Zamknij pomoc</Button>
    </div>
    <p className="text-sm text-zinc-600">Dołączone pytanie pozostaje to samo, gdy przechodzisz dalej w sesji.</p>
    {answer && <RagResponse answer={answer} sources={state.values?.sources as SourceRef[] | undefined} />}
    <form action={action} onSubmit={() => { submitted.current = questionInput.current?.value ?? '' }} className="space-y-3">
      <Input type="hidden" name="practiceContext" value={JSON.stringify({ ...contextReference, purpose: messages.length ? 'follow_up' : 'explain' })} />
      <Input type="hidden" name="recentMessages" value={JSON.stringify(messages)} />
      <Label htmlFor="practice-tutor-question" label="Pytanie do asystenta" />
      <Input inputRef={questionInput} id="practice-tutor-question" name="question" type="text"
        defaultValue="Wyjaśnij odpowiedź na dołączone pytanie." disabled={pending}
        className="min-h-11 w-full rounded-lg border border-zinc-300 px-3 py-2 focus-visible:outline-rose-500" />
      <FieldError name="question" formState={state} />
      <FormError formState={state} />
      <Button type="submit" size="lg" disabled={pending}>{pending ? 'Szukam w materiałach…' : 'Zapytaj'}</Button>
      {pending && <p role="status">Przygotowywanie odpowiedzi. Możesz kontynuować ćwiczenie.</p>}
      {toastFallback}
    </form>
  </Card>
}
