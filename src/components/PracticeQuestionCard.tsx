'use client'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import RadioOption from '@/components/ui/RadioOption'
import FieldError from '@/components/FieldError'
import { usePracticeCardForm } from '@/hooks/usePracticeCardForm'
import { useToastMessage } from '@/hooks/useToastMessage'
import LearningCheckMark from '@/components/learning/LearningCheckMark'
import type { PracticeQuestionCardProps } from '@/types/learningUiTypes'

export default function PracticeQuestionCard(props: PracticeQuestionCardProps) {
  const { category, question, number, session, progress, active, comparing, onFocus } = props
  const { state, action, pending, eventInput, submittedEventId, events, selected, select, clearSelection } = usePracticeCardForm(props)
  const toast = useToastMessage(state)
  return <article id={`learning-card-${question.id}`} tabIndex={0} onFocusCapture={onFocus}
    className="learning-card" data-active={active} data-comparing={comparing} aria-label={`Karta ${number}`}>
    <Card className="min-w-0 space-y-4 rounded-3xl p-5 sm:p-7">
      <form action={action} className="min-w-0 space-y-4" onSubmit={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
        const value = new FormData(event.currentTarget).get('selected')
        const signature = `${session?.version ?? 0}:${submitter?.value}:${value}`
        const eventId = events.current.get(signature) ?? crypto.randomUUID()
        events.current.set(signature, eventId)
        submittedEventId.current = eventId
        if (eventInput.current) eventInput.current.value = eventId
      }}>
        <Input type="hidden" name="category" value={category} />
        <Input type="hidden" name="sessionId" value={session?.id ?? ''} />
        <Input type="hidden" name="version" value={session?.version ?? 0} />
        <Input type="hidden" name="questionId" value={question.id} />
        <Input type="hidden" name="eventId" inputRef={eventInput} />
        <header className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
          <span className="rounded-lg bg-zinc-100 px-2 py-1">{String(number).padStart(2, '0')}</span>
          <span className="flex-1">{category.replace(/-/g, ' ')}</span>
          {progress?.resolved && <span className="inline-flex items-center gap-1 text-violet-600"><LearningCheckMark />Sprawdzona</span>}
        </header>
        <h2 className="break-words text-base font-medium leading-relaxed text-zinc-900 sm:text-lg">{question.question}</h2>
        {progress?.priorExposure && !progress.attempts &&
          <p className="text-xs text-violet-600">Widziałeś już tę kartę. Kolejna odpowiedź będzie oznaczona jako wspomagana.</p>}
        {!question.practiceable && <p className="text-sm text-zinc-500">Karta do czytania — nie ma jednej odpowiedzi do sprawdzenia.</p>}
        {comparing && <p className="text-xs text-violet-600">Porównaj sformułowania odpowiedzi z treścią pytania.</p>}
        <fieldset disabled={pending || Boolean(session && session.status !== 'active') ||
          progress?.resolved || !question.practiceable} className="min-w-0 space-y-2.5">
          <legend className="sr-only">Odpowiedzi do karty {number}</legend>
          {question.options.map((option, index) => <div key={index} className="learning-option" data-correct={progress?.correctIndex === index}>
            <RadioOption name="selected" value={index} checked={(selected ?? progress?.selected) === index}
              onChange={() => select(index)}>
              <span>{String.fromCharCode(65 + index)}. {option}</span>
              {progress?.correctIndex === index && <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-violet-700">
                <LearningCheckMark />Poprawna odpowiedź
              </span>}
            </RadioOption>
          </div>)}
        </fieldset>
        <FieldError name="selected" formState={state} />
        {progress && <p role="status" className="text-sm text-zinc-500">
          {progress.correct ? 'Dobra robota. Odpowiedź zapisana.'
            : progress.correctIndex !== null ? 'Odpowiedź została ujawniona.'
            : progress.correct === false ? 'Spróbuj jeszcze raz. Wolfek jest obok, jeśli potrzebujesz pomocy.' : ''}
        </p>}
        {(!session || session.status === 'active') && !progress?.resolved && question.practiceable &&
          <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" name="command" value="answer" size="lg" disabled={pending} className="learning-check">
            {pending ? 'Zapisywanie…' : 'Sprawdź swój wybór'}
          </Button>
          <Button type="submit" name="command" value="reveal" size="lg" variant="ghost" disabled={pending}>Pokaż poprawną odpowiedź</Button>
        </div>}
        {session?.status === 'active' && progress?.outcome === 'revealed' && question.practiceable &&
          <Button type="submit" name="command" value="review" size="md" variant="ghost"
            disabled={pending} onClick={clearSelection}>Spróbuj ponownie bez podpowiedzi</Button>}
        {toast}
      </form>
    </Card>
  </article>
}
