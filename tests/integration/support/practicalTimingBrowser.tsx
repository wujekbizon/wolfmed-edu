import React, { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { usePracticalExamState } from '@/hooks/usePracticalExamState'
import PracticalExamTimer from '@/components/PracticalExamTimer'
import type { PublicExam } from '@/types/praktycznyTypes'
import { probe } from './practicalTimingGrader'

const exam: PublicExam = {
  id: 'timing-fixture', title: 'Timing fixture', year: 2026, session: 'Styczeń 2026',
  arkusz: 'fixture', durationMinutes: 120, taskSummary: '', assessedTasks: [], forms: [],
  patient: { name: 'Fixture', ward: 'Fixture', description: '' },
}

function TimingProbe() {
  const session = usePracticalExamState(exam)
  const formRef = useRef<HTMLFormElement>(null)
  const [, rerender] = useState(0)
  return (
    <>
      <button id='start' onClick={session.handleStart}>Start</button>
      <button id='rerender' onClick={() => rerender((value) => value + 1)}>Rerender</button>
      <button id='answer' onClick={() => session.handleValueChange('fixture', 'answer')}>Answer</button>
      <button id='restart' onClick={session.handleRestart}>Restart</button>
      <output id='pending'>{String(session.isPending)}</output>
      {session.stage === 'exam' && (
        <>
          <PracticalExamTimer durationMinutes={exam.durationMinutes} startTime={session.startTime} isSubmitting={session.isPending} onTimeUp={() => formRef.current?.requestSubmit()} />
          <form ref={formRef} action={session.action} onSubmitCapture={session.handleSubmitCapture} onSubmit={(event) => { if (!event.defaultPrevented) probe.submissions++ }}>
            <input type='hidden' name='examId' value={exam.id} />
            <input type='hidden' name='answers' value={JSON.stringify(session.answers)} />
            <input type='hidden' name='timeSpent' defaultValue='0' />
            <button id='submit' type='submit' disabled={session.isPending}>Submit</button>
          </form>
        </>
      )}
    </>
  )
}

Object.assign(window, {
  timingSnapshot: () => ({ submissions: probe.submissions, calls: [...probe.calls], studyMinutes: [...probe.studyMinutes] }),
  timingRelease: (status: 'SUCCESS' | 'ERROR') => probe.pending.shift()?.(status),
})
createRoot(document.getElementById('root')!).render(<TimingProbe />)
