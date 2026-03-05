"use client"

import { useState, useTransition } from 'react'
import { showToast } from '@/hooks/useToastMessage'
import type { Cell, LearningPlan, MediaCellContent } from '@/types/cellTypes'
import { useRagProgress } from '@/hooks/useRagProgress'
import { generateLectureAction } from '@/actions/rag-actions'
import { useCellsStore } from '@/store/useCellsStore'
import PlanHeader from './PlanHeader'
import PlanPrerequisites from './PlanPrerequisites'
import PlanStepItem from './PlanStepItem'
import PlanFooter from './PlanFooter'

interface GeneratedLecture {
  audioUrl: string
  title: string
  transcript: string
  lectureId: string
}

export default function PlanCellPreview({ cell }: { cell: Cell }) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]))
  const [isPending, startTransition] = useTransition()
  const [generatedLecture, setGeneratedLecture] = useState<GeneratedLecture | null>(null)
  const insertCellAfterWithContent = useCellsStore(s => s.insertCellAfterWithContent)

  const {
    jobId,
    stage,
    progress,
    message: progressMessage,
    tool,
    userLogs,
    technicalLogs,
    error: progressError,
    startListening,
    reset: resetProgress,
  } = useRagProgress()

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

  const handleGenerate = () => {
    startListening()
    startTransition(async () => {
      const result = await generateLectureAction(cell.content, jobId)
      resetProgress()

      if (result.status === 'SUCCESS') {
        const { audioUrl, title, transcript, lectureId } = result.values as unknown as GeneratedLecture

        const mediaContent: MediaCellContent = {
          sourceType: 'audio',
          title: `Wykład: ${title}`,
          url: audioUrl,
          lectureId,
          transcript,
        }

        insertCellAfterWithContent(cell.id, 'media', JSON.stringify(mediaContent))
        setGeneratedLecture({ audioUrl, title, transcript, lectureId })
        showToast('SUCCESS', 'Wykład gotowy!')
      } else {
        showToast('ERROR', result.message || 'Nie udało się wygenerować wykładu.')
      }
    })
  }

  const handleSaveScript = () => {
    if (!generatedLecture) return
    insertCellAfterWithContent(cell.id, 'note', generatedLecture.transcript)
    showToast('SUCCESS', 'Skrypt zapisany jako notatka.')
  }

  return (
    <>
      <PlanHeader
        topic={plan.topic}
        goal={plan.goal}
        estimatedTotalMinutes={plan.estimatedTotalMinutes}
      />

      <PlanPrerequisites prerequisites={plan.prerequisites ?? []} />

      <div className="divide-y divide-zinc-100 overflow-y-auto flex-1 scrollbar-thin scrollbar-webkit">
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
        isPending={isPending}
        onGenerate={handleGenerate}
        onSaveScript={generatedLecture ? handleSaveScript : undefined}
        stage={stage}
        progress={progress}
        progressMessage={progressMessage}
        tool={tool}
        userLogs={userLogs}
        technicalLogs={technicalLogs}
        progressError={progressError}
      />
    </>
  )
}
