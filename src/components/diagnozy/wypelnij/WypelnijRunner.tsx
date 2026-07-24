'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { markDiagnozaCompletedAction } from '@/actions/diagnozy'
import { buildWypelnijSteps } from '@/helpers/buildWypelnijSteps'
import WypelnijCasePanel from '@/components/diagnozy/wypelnij/WypelnijCasePanel'
import WypelnijStepper from '@/components/diagnozy/wypelnij/WypelnijStepper'
import SelectStep from '@/components/diagnozy/wypelnij/SelectStep'
import PrzewodnikSummary from '@/components/diagnozy/wypelnij/PrzewodnikSummary'
import type { Diagnoza } from '@/types/diagnozyTypes'

export default function WypelnijRunner({
  diagnoza,
  alreadyCompleted,
}: {
  diagnoza: Diagnoza
  alreadyCompleted: boolean
}) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const steps = buildWypelnijSteps(diagnoza)
  const [stepIndex, setStepIndex] = useState(0)
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [completed, setCompleted] = useState(alreadyCompleted)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSummary = stepIndex === steps.length
  const currentStep = isSummary ? null : steps[stepIndex]!
  const stepTitles = [...steps.map((step) => step.title), 'Podsumowanie']

  const toggle = (stepKey: string, text: string, multi: boolean) => {
    setSelections((prev) => {
      const current = prev[stepKey] ?? []
      if (!multi) return { ...prev, [stepKey]: current.includes(text) ? [] : [text] }
      return {
        ...prev,
        [stepKey]: current.includes(text)
          ? current.filter((item) => item !== text)
          : [...current, text],
      }
    })
  }

  // Active recall: a step is done when every book-sourced item was selected
  const stepDone = (index: number) =>
    (selections[steps[index]!.key] ?? []).length === steps[index]!.options.length

  const handleComplete = async () => {
    setSubmitting(true)
    setError(null)
    const result = await markDiagnozaCompletedAction(diagnoza.slug)
    setSubmitting(false)
    if (result.status === 'SUCCESS') {
      setCompleted(true)
      router.refresh()
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <WypelnijCasePanel opisPrzypadku={diagnoza.opisPrzypadku} />
      </div>

      <WypelnijStepper
        stepTitles={stepTitles}
        currentIndex={stepIndex}
        canGoNext={!isSummary && stepDone(stepIndex)}
        onBack={() => setStepIndex((index) => Math.max(0, index - 1))}
        onNext={() => setStepIndex((index) => Math.min(steps.length, index + 1))}
      >
        <motion.div
          key={stepIndex}
          initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          {currentStep ? (
            <SelectStep
              step={currentStep}
              selected={selections[currentStep.key] ?? []}
              onToggle={(text) => toggle(currentStep.key, text, currentStep.multi)}
            />
          ) : (
            <PrzewodnikSummary
              rows={[
                { label: 'Diagnoza pielęgniarska', items: selections['diagnoza'] ?? [] },
                { label: 'Cel', items: selections['cele'] ?? [] },
                { label: 'Planowane interwencje', items: selections['interwencje'] ?? [] },
                { label: 'Zrealizowane interwencje', items: selections['interwencje'] ?? [] },
                { label: 'Ocena', items: selections['ocena'] ?? [] },
              ]}
              completed={completed}
              submitting={submitting}
              error={error}
              onComplete={handleComplete}
            />
          )}
        </motion.div>
      </WypelnijStepper>
    </div>
  )
}
