'use client'

import { useDiagnozyExam } from '@/hooks/useDiagnozyExam'
import { getEgzaminStepAt } from '@/helpers/getEgzaminStepAt'
import { EXAM_DURATION_MINUTES } from '@/constants/diagnozyEgzamin'
import WypelnijCasePanel from '@/components/diagnozy/wypelnij/WypelnijCasePanel'
import EgzaminStart from '@/components/diagnozy/egzamin/EgzaminStart'
import EgzaminStep from '@/components/diagnozy/egzamin/EgzaminStep'
import EgzaminNav from '@/components/diagnozy/egzamin/EgzaminNav'
import EgzaminTimer from '@/components/diagnozy/egzamin/EgzaminTimer'
import EgzaminResult from '@/components/diagnozy/egzamin/EgzaminResult'
import WykonanieStep from '@/components/diagnozy/egzamin/WykonanieStep'

export default function EgzaminRunner() {
  const {
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
  } = useDiagnozyExam()

  if (result) return <EgzaminResult result={result} timeSpent={timeSpent} onRetry={start} />

  if (!exam) return <EgzaminStart loading={loading} onStart={start} />

  const stepCount = exam.steps.length + 1
  const step = getEgzaminStepAt(exam.steps, stepIndex)

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
        <WypelnijCasePanel opisPrzypadku={exam.caseText} defaultOpen={stepIndex === 0} />
      </div>

      {step ? (
        <EgzaminStep
          step={step}
          chosen={answers[step.field]}
          onToggle={(option) => toggle(step.field, option, step.multi)}
        />
      ) : (
        <WykonanieStep interwencje={answers.interwencje} zones={zones} onAssign={assignZone} />
      )}

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
