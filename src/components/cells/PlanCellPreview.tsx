"use client"

import { useState } from 'react'
import type { Cell, LearningPlan } from '@/types/cellTypes'
import { useLectureGeneration } from '@/hooks/useLectureGeneration'
import PlanHeader from './PlanHeader'
import PlanPrerequisites from './PlanPrerequisites'
import PlanStepItem from './PlanStepItem'
import PlanFooter from './PlanFooter'

export default function PlanCellPreview({ cell }: { cell: Cell }) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]))
  const lecture = useLectureGeneration(cell)

  let plan: LearningPlan | null = null
  try {
    plan = JSON.parse(cell.content) as LearningPlan
  } catch {
    return (
      <div className="p-4 text-sm text-zinc-500">Nie udało się wczytać planu nauki.</div>
    )
  }

  const toggleStep = (index: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <>
      <PlanHeader
        topic={plan.topic}
        goal={plan.goal}
        estimatedTotalMinutes={plan.estimatedTotalMinutes}
      />

      {/* min-h-0 lets this shrink below its content; without it the flex child
          refuses to scroll and the footer gets clipped by the cell instead. */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-webkit">
        <PlanPrerequisites prerequisites={plan.prerequisites ?? []} />

        <div className="divide-y divide-zinc-100">
          {plan.steps?.map((step, index) => (
            <PlanStepItem
              key={step.number}
              step={step}
              isExpanded={expandedSteps.has(index)}
              onToggle={() => toggleStep(index)}
            />
          ))}
        </div>

        <PlanFooter
          summary={plan.summary}
          examRelevance={plan.examRelevance}
          isPending={lecture.isPending}
          lectureGenerated={lecture.generatedLecture !== null}
          onGenerate={lecture.generate}
          onSaveScript={lecture.generatedLecture ? lecture.saveScript : undefined}
        />
      </div>
    </>
  )
}
