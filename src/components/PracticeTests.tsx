'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { submitPracticeTestAction } from '@/actions/submitPracticeTest'
import { useToastMessage } from '@/hooks/useToastMessage'
import { usePracticeProgressAutosave } from '@/hooks/usePracticeProgressAutosave'
import type { ExamQuestion } from '@/types/dataTypes'
import type { FormState } from '@/types/actionTypes'
import TestCard from '@/components/TestCard'
import SubmitButton from '@/components/SubmitButton'
import Input from '@/components/ui/Input'

export default function PracticeTests({
  tests,
  sessionId,
  initialProgress,
}: {
  tests: ExamQuestion[]
  sessionId: string
  initialProgress: Record<string, number>
}) {
  const [state, action] = useActionState(submitPracticeTestAction, EMPTY_FORM_STATE)
  const [answers, setAnswers] = useState(initialProgress)
  const { selectAnswer: queueAnswer, status: saveStatus } = usePracticeProgressAutosave(sessionId, initialProgress)
  const router = useRouter()
  const noScriptFallback = useToastMessage(state)

  useEffect(() => {
    if (state.status === 'SUCCESS') router.push('/panel/wyniki')
  }, [state.status, router])

  const selectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((current) => ({ ...current, [questionId]: answerIndex }))
    queueAnswer(questionId, answerIndex)
  }

  const formState: FormState = state
  return (
    <section className="flex h-full w-full flex-col items-center gap-8">
      <p className="w-full text-center text-sm text-zinc-600">
        Tryb próbny bez limitu czasu. Postęp zapisuje się automatycznie.
      </p>
      <form action={action} className="grid w-full grid-cols-1 gap-8 lg:w-3/4 xl:w-2/3">
        <Input type="hidden" name="sessionId" value={sessionId} />
        {Object.entries(answers).map(([questionId, answerIndex]) => (
          <Input
            key={questionId}
            type="hidden"
            name={`answer-${questionId}`}
            value={answerIndex}
          />
        ))}
        {tests.map((test, index) => (
          <TestCard
            key={test.id}
            test={test}
            formState={formState}
            questionNumber={`${index + 1}/${tests.length}`}
            selectedIndex={answers[test.id] ?? null}
            includeAnswerInForm={false}
            onSelect={(answerIndex) => selectAnswer(test.id, answerIndex)}
          />
        ))}
        <div className="flex flex-col items-center gap-2 pb-10">
          <span className="text-xs text-zinc-500" aria-live="polite">
            {saveStatus === 'saving' && 'Zapisywanie postępu…'}
            {saveStatus === 'unsaved' && 'Postęp zapisze się automatycznie.'}
            {saveStatus === 'saved' && 'Postęp zapisany.'}
            {saveStatus === 'error' && 'Nie udało się zapisać. Ponowimy próbę.'}
          </span>
          <SubmitButton label="Zakończ i sprawdź wynik" loading="Sprawdzam..." />
          <div className="pt-2"><p className="text-sm text-red-600">{state.message}</p></div>
        </div>
        {noScriptFallback}
      </form>
    </section>
  )
}
