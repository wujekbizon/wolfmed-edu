'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Info, ListOrdered, Package, X } from 'lucide-react'
import { useCountdownTestTimer } from '@/hooks/useCountdownTestTimer'
import { gradePracticalExamAction } from '@/actions/praktyczny'
import { showToast } from '@/hooks/useToastMessage'
import SubmitButton from '@/components/SubmitButton'
import ExamArkuszBrief from '@/components/ExamArkuszBrief'
import ExamCaseSidebar from '@/components/ExamCaseSidebar'
import ExamSectionHeader from '@/components/ExamSectionHeader'
import ExamFormCard from '@/components/ExamFormCard'
import OrderableSteps from '@/components/OrderableSteps'
import ExamResults from '@/components/ExamResults'
import { EMPTY_PRACTICAL_EXAM_STATE } from '@/types/praktycznyTypes'
import type { ExamAnswers, PublicExam } from '@/types/praktycznyTypes'

type Stage = 'brief' | 'exam' | 'results'

function buildInitialAnswers(exam: PublicExam): ExamAnswers {
  const answers: ExamAnswers = {}
  for (const form of exam.forms) {
    for (const field of form.fields) {
      const key = `${form.id}:${field.id}`
      if (field.kind === 'list') answers[key] = Array<string>(field.lines).fill('')
      else if (field.kind === 'choice') answers[key] = []
      else answers[key] = ''
    }
  }
  exam.assessedTasks.forEach((task, index) => {
    if (task.type === 'procedure') answers[`procedure:${index}`] = []
  })
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
  const [state, action, isPending] = useActionState(gradePracticalExamAction, EMPTY_PRACTICAL_EXAM_STATE)
  const formRef = useRef<HTMLFormElement>(null)
  const prevTimestamp = useRef(state.timestamp)

  const timeSpent = useMemo(() => Math.floor((Date.now() - startTime) / 1000), [startTime, state.timestamp])

  // Flat list of scrollable sections (assessed tasks first, then form cards) so
  // we can show a "section X of Y" position indicator while scrolling.
  const sections = useMemo(() => {
    const titles = exam.assessedTasks.map((t) => t.title)
    exam.forms.forEach((f) => titles.push(f.title))
    return titles
  }, [exam])
  const taskCount = exam.assessedTasks.length
  const totalSections = sections.length

  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionEls = useRef<(HTMLElement | null)[]>([])
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    if (stage !== 'exam') return
    const root = scrollRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        )
        const idx = sectionEls.current.indexOf(topMost.target as HTMLElement)
        if (idx !== -1) setActiveSection(idx)
      },
      { root, rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    )
    sectionEls.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [stage, totalSections])

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

  const handleOrderChange = (taskIndex: number, order: string[]) => {
    setAnswers((prev) => ({ ...prev, [`procedure:${taskIndex}`]: order }))
  }

  const handleChoiceToggle = (key: string, optionId: string) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[key]) ? (prev[key] as string[]) : []
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
      return { ...prev, [key]: next }
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
    return <ExamResults result={state.result} answers={answers} onRestart={handleRestart} />
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

      {/* Position indicator */}
      <div className="shrink-0 flex items-center gap-3 border-b border-zinc-200 bg-white px-4 md:px-6 py-2">
        <span className="text-[11px] font-medium text-zinc-500 shrink-0 whitespace-nowrap">
          Sekcja {activeSection + 1}/{totalSections}
        </span>
        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-700 rounded-full transition-all duration-300"
            style={{ width: `${((activeSection + 1) / totalSections) * 100}%` }}
          />
        </div>
        <span className="hidden sm:block text-[11px] text-zinc-400 truncate max-w-[45%]">
          {sections[activeSection]}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-webkit px-2 sm:px-4 py-6">
          <form ref={formRef} id="exam-form" action={action} className="w-full max-w-3xl mx-auto flex flex-col gap-6 pb-28 lg:pb-0">
            <input type="hidden" name="examId" value={exam.id} />
            <input type="hidden" name="answers" value={JSON.stringify(answers)} />
            <input type="hidden" name="timeSpent" value={timeSpent} />

            {exam.assessedTasks.map((task, taskIndex) => {
              if (task.type === 'equipment') {
                return (
                  <div
                    key={taskIndex}
                    ref={(el) => {
                      sectionEls.current[taskIndex] = el
                    }}
                    className="bg-white border border-zinc-200 rounded-2xl overflow-hidden scroll-mt-4 shadow-sm"
                  >
                    <ExamSectionHeader
                      icon={Package}
                      badge="Zestaw do przygotowania"
                      title={task.title}
                    />
                    <ul className="p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {task.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 rounded-lg border border-zinc-100 bg-zinc-50/70 px-3 py-2.5 text-sm text-zinc-700"
                        >
                          <span className="shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-md bg-white border border-zinc-200 text-slate-500">
                            <Check className="w-3 h-3" />
                          </span>
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              }
              return (
                <div
                  key={taskIndex}
                  ref={(el) => {
                    sectionEls.current[taskIndex] = el
                  }}
                  className="bg-white border border-zinc-200 rounded-2xl overflow-hidden scroll-mt-4 shadow-sm"
                >
                  <ExamSectionHeader
                    icon={ListOrdered}
                    badge="Czynności — ułóż w kolejności"
                    title={task.title}
                  />
                  <div className="p-5 md:p-6">
                    <OrderableSteps
                      steps={task.items}
                      onOrderChange={(order) => handleOrderChange(taskIndex, order)}
                    />
                  </div>
                </div>
              )
            })}

            {exam.forms.map((form, index) => (
              <div
                key={form.id}
                ref={(el) => {
                  sectionEls.current[taskCount + index] = el
                }}
                className="scroll-mt-4"
              >
                <ExamFormCard
                  exam={exam}
                  form={form}
                  index={index}
                  answers={answers}
                  onValueChange={handleValueChange}
                  onListLineChange={handleListLineChange}
                  onChoiceToggle={handleChoiceToggle}
                />
              </div>
            ))}

            {/* Desktop submit — mobile uses the sticky bottom bar */}
            <div className="hidden lg:flex flex-col sm:flex-row gap-3 pb-4">
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

      {/* Fixed mobile submit bar — pinned to the bottom of the viewport */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button
          type="submit"
          form="exam-form"
          disabled={isPending}
          className="w-full h-12 inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl border border-slate-600 transition-colors"
        >
          {isPending ? 'Sprawdzanie...' : 'Zakończ i sprawdź arkusz'}
        </button>
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
