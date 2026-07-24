'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle, Play } from 'lucide-react'
import { startDiagnozyExamAction, submitDiagnozyExamAction } from '@/actions/diagnozy'
import WypelnijCasePanel from '@/components/diagnozy/wypelnij/WypelnijCasePanel'
import EgzaminStep from '@/components/diagnozy/egzamin/EgzaminStep'
import EgzaminNav from '@/components/diagnozy/egzamin/EgzaminNav'
import EgzaminTimer from '@/components/diagnozy/egzamin/EgzaminTimer'
import EgzaminResult from '@/components/diagnozy/egzamin/EgzaminResult'
import WykonanieStep from '@/components/diagnozy/egzamin/WykonanieStep'
import type {
  BodyZone,
  BodyZoneAssignments,
  DiagnozyExamAnswers,
  DiagnozyExamPayload,
  DiagnozyExamResult,
} from '@/types/diagnozyTypes'

const EMPTY_ANSWERS: DiagnozyExamAnswers = { diagnoza: [], cele: [], interwencje: [], ocena: [] }
const EXAM_DURATION_MINUTES = 30

export default function EgzaminRunner() {
  const router = useRouter()
  const [exam, setExam] = useState<DiagnozyExamPayload | null>(null)
  const [startedAt, setStartedAt] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<DiagnozyExamAnswers>(EMPTY_ANSWERS)
  const [zones, setZones] = useState<BodyZoneAssignments>({})
  const [result, setResult] = useState<DiagnozyExamResult | null>(null)
  const [timeSpent, setTimeSpent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    const response = await startDiagnozyExamAction()
    setLoading(false)
    if (response.status === 'SUCCESS') {
      setExam(response.exam)
      setAnswers(EMPTY_ANSWERS)
      setZones({})
      setStepIndex(0)
      setStartedAt(Date.now())
    } else {
      setError(response.message)
    }
  }

  const toggle = (field: keyof DiagnozyExamAnswers, option: string, multi: boolean) => {
    setAnswers((prev) => {
      const current = prev[field]
      if (!multi) return { ...prev, [field]: current.includes(option) ? [] : [option] }
      return {
        ...prev,
        [field]: current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option],
      }
    })
  }

  const submit = async () => {
    if (!exam || submitting) return
    const elapsed = Math.min(
      Math.round((Date.now() - startedAt) / 1000),
      EXAM_DURATION_MINUTES * 60
    )
    setSubmitting(true)
    setError(null)
    const response = await submitDiagnozyExamAction({
      slug: exam.slug,
      answers,
      zones,
      timeSpent: elapsed,
    })
    setSubmitting(false)
    if (response.status === 'SUCCESS') {
      setResult(response.result)
      setTimeSpent(elapsed)
      setExam(null)
      router.refresh()
    } else {
      setError(response.message)
    }
  }

  if (result) return <EgzaminResult result={result} timeSpent={timeSpent} onRetry={start} />

  if (!exam) {
    return (
      <div className="flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={start}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-full
            text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Rozpocznij egzamin
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }

  // Display steps: payload's 4 + the mannequin "Wykonanie" step before Ocena
  const WYKONANIE_INDEX = 3
  const stepCount = exam.steps.length + 1
  const isWykonanie = stepIndex === WYKONANIE_INDEX
  const step = isWykonanie
    ? null
    : exam.steps[stepIndex < WYKONANIE_INDEX ? stepIndex : stepIndex - 1]!

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wide">
          {step ? step.label : 'Wykonanie na fantomie'}
        </h2>
        <EgzaminTimer
          key={startedAt}
          durationMinutes={EXAM_DURATION_MINUTES}
          onTimeUp={submit}
        />
      </div>
      <div className="mb-6">
        <WypelnijCasePanel opisPrzypadku={exam.caseText} />
      </div>
      {step ? (
        <EgzaminStep
          step={step}
          chosen={answers[step.field]}
          onToggle={(option) => toggle(step.field, option, step.multi)}
        />
      ) : (
        <WykonanieStep
          interwencje={answers.interwencje}
          zones={zones}
          onAssign={(interwencja: string, zone: BodyZone) =>
            setZones((prev) => ({ ...prev, [interwencja]: zone }))
          }
        />
      )}
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <EgzaminNav
        stepIndex={stepIndex}
        stepCount={stepCount}
        isLast={stepIndex === stepCount - 1}
        submitting={submitting}
        onBack={() => setStepIndex((index) => Math.max(0, index - 1))}
        onNext={() => setStepIndex((index) => Math.min(stepCount - 1, index + 1))}
        onSubmit={submit}
      />
    </div>
  )
}
