'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Info, X } from 'lucide-react'
import { useCountdownTestTimer } from '@/hooks/useCountdownTestTimer'
import { gradePracticalExamAction } from '@/actions/praktyczny'
import { showToast } from '@/hooks/useToastMessage'
import SubmitButton from '@/components/SubmitButton'
import ExamArkuszBrief from '@/components/ExamArkuszBrief'
import ExamCaseSidebar from '@/components/ExamCaseSidebar'
import ExamFormCard from '@/components/ExamFormCard'
import ExamResults from '@/components/ExamResults'
import { EMPTY_PRACTICAL_EXAM_STATE } from '@/types/praktycznyTypes'
import type { ExamAnswers, PublicExam } from '@/types/praktycznyTypes'

type Stage = 'brief' | 'exam' | 'results'

function buildInitialAnswers(exam: PublicExam): ExamAnswers {
  const answers: ExamAnswers = {}
  for (const form of exam.forms) {
    for (const field of form.fields) {
      const key = `${form.id}:${field.id}`
      answers[key] = field.kind === 'list' ? Array<string>(field.lines).fill('') : ''
    }
  }
  return answers
}

function ExamTimer({ durationMinutes, onTimeUp }: { durationMinutes: number; onTimeUp: () => void }) {
  const { timeLeft, isWarning, isTimeUp } = useCountdownTestTimer({ durationMinutes })

  useEffect(() => {
    if (isTimeUp) onTimeUp()
  }, [isTimeUp, onTimeUp])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div
      className={`font-mono text-base font-bold px-3 py-1.5 rounded-lg ${
        isWarning ? 'bg-red-500/15 text-red-600' : 'bg-green-500/15 text-green-700'
      }`}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}

interface Props {
  exam: PublicExam
}

export default function PracticalExamRunner({ exam }: Props) {
  const [stage, setStage] = useState<Stage>('brief')
  const [answers, setAnswers] = useState<ExamAnswers>(() => buildInitialAnswers(exam))
  const [startTime, setStartTime] = useState(0)
  const [infoOpen, setInfoOpen] = useState(false)
  const [state, action] = useActionState(gradePracticalExamAction, EMPTY_PRACTICAL_EXAM_STATE)
  const formRef = useRef<HTMLFormElement>(null)
  const prevTimestamp = useRef(state.timestamp)

  const timeSpent = useMemo(() => Math.floor((Date.now() - startTime) / 1000), [startTime, state.timestamp])

  useEffect(() => {
    if (state.timestamp === prevTimestamp.current) return
    prevTimestamp.current = state.timestamp
    if (state.message) showToast(state.status === 'ERROR' ? 'ERROR' : 'SUCCESS', state.message)
    if (state.status === 'SUCCESS' && state.result) setStage('results')
  }, [state])

  const handleValueChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const handleListLineChange = (key: string, line: number, value: string) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[key]) ? [...(prev[key] as string[])] : []
      current[line] = value
      return { ...prev, [key]: current }
    })
  }

  const handleStart = () => {
    setStartTime(Date.now())
    setStage('exam')
  }

  const handleRestart = () => {
    setAnswers(buildInitialAnswers(exam))
    setStartTime(0)
    setStage('brief')
  }

  if (stage === 'brief') {
    return <ExamArkuszBrief exam={exam} onStart={handleStart} />
  }

  if (stage === 'results' && state.result) {
    return <ExamResults exam={exam} result={state.result} answers={answers} onRestart={handleRestart} />
  }

  return (
    <section className="flex flex-col w-full h-full overflow-hidden">
      <div className="shrink-0 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 md:px-6 py-3">
        <Link
          href="/panel/egzaminy"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Przerwij
        </Link>
        <p className="hidden sm:block text-sm font-semibold text-zinc-700 truncate">{exam.title}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            Pacjent
          </button>
          <ExamTimer durationMinutes={exam.durationMinutes} onTimeUp={() => formRef.current?.requestSubmit()} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-webkit px-2 sm:px-4 py-6">
          <form ref={formRef} action={action} className="w-full max-w-3xl mx-auto flex flex-col gap-6">
            <input type="hidden" name="examId" value={exam.id} />
            <input type="hidden" name="answers" value={JSON.stringify(answers)} />
            <input type="hidden" name="timeSpent" value={timeSpent} />

            {exam.forms.map((form, index) => (
              <ExamFormCard
                key={form.id}
                exam={exam}
                form={form}
                index={index}
                answers={answers}
                onValueChange={handleValueChange}
                onListLineChange={handleListLineChange}
              />
            ))}

            <div className="flex flex-col sm:flex-row gap-3 pb-4">
              <SubmitButton
                label="Zakończ i sprawdź arkusz"
                loading="Sprawdzanie..."
                className="flex-1 h-12 px-8 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl border border-slate-600 transition-colors"
              />
            </div>
          </form>
        </div>

        <aside className="hidden lg:block w-80 xl:w-96 shrink-0 border-l border-zinc-200 bg-white overflow-y-auto scrollbar-webkit">
          <ExamCaseSidebar exam={exam} />
        </aside>
      </div>

      {infoOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setInfoOpen(false)} />
          <div className="relative w-[88%] max-w-sm h-full bg-white overflow-y-auto scrollbar-webkit shadow-xl">
            <div className="sticky top-0 flex items-center justify-between px-5 py-3 border-b border-zinc-200 bg-white">
              <p className="text-sm font-semibold text-zinc-700">Szczegóły przypadku</p>
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ExamCaseSidebar exam={exam} />
          </div>
        </div>
      )}
    </section>
  )
}
