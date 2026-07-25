import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { startDiagnozyExamAction, submitDiagnozyExamAction } from '@/actions/diagnozy'
import { showToast } from '@/hooks/useToastMessage'
import { EMPTY_ANSWERS, EXAM_DURATION_MINUTES } from '@/constants/diagnozyEgzamin'
import type {
  BodyZone,
  BodyZoneAssignments,
  DiagnozyExamAnswers,
  DiagnozyExamPayload,
  DiagnozyExamResult,
} from '@/types/diagnozyTypes'

export function useDiagnozyExam() {
  const router = useRouter()
  const [exam, setExam] = useState<DiagnozyExamPayload | null>(null)
  const [startedAt, setStartedAt] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<DiagnozyExamAnswers>(EMPTY_ANSWERS)
  const [zones, setZones] = useState<BodyZoneAssignments>({})
  const [result, setResult] = useState<DiagnozyExamResult | null>(null)
  const [timeSpent, setTimeSpent] = useState(0)
  const [loading, startLoading] = useTransition()
  const [submitting, startSubmitting] = useTransition()

  // The timer's onTimeUp and the user's submit click are separate event sources,
  // so a state flag would let both through before either re-render lands.
  const submitLock = useRef(false)

  const start = () =>
    startLoading(async () => {
      setResult(null)
      const response = await startDiagnozyExamAction()

      if (response.status !== 'SUCCESS') {
        showToast('ERROR', response.message)
        return
      }

      submitLock.current = false
      setExam(response.exam)
      setAnswers(EMPTY_ANSWERS)
      setZones({})
      setStepIndex(0)
      setStartedAt(Date.now())
    })

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

  const assignZone = (interwencja: string, zone: BodyZone) =>
    setZones((prev) => ({ ...prev, [interwencja]: zone }))

  const submit = () => {
    if (!exam || submitLock.current) return
    submitLock.current = true

    const elapsed = Math.min(
      Math.round((Date.now() - startedAt) / 1000),
      EXAM_DURATION_MINUTES * 60
    )

    startSubmitting(async () => {
      const response = await submitDiagnozyExamAction({
        slug: exam.slug,
        answers,
        zones,
        timeSpent: elapsed,
      })

      if (response.status !== 'SUCCESS') {
        submitLock.current = false
        showToast('ERROR', response.message)
        return
      }

      setResult(response.result)
      setTimeSpent(elapsed)
      setExam(null)
      router.refresh()
    })
  }

  return {
    exam,
    startedAt,
    stepIndex,
    setStepIndex,
    answers,
    zones,
    result,
    timeSpent,
    loading,
    submitting,
    start,
    toggle,
    assignZone,
    submit,
  }
}
