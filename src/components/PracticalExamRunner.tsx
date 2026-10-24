'use client'

import ExamArkuszBrief from '@/components/ExamArkuszBrief'
import ExamResults from '@/components/ExamResults'
import PracticalExamWorkspace from '@/components/PracticalExamWorkspace'
import { usePracticalExamState } from '@/hooks/usePracticalExamState'
import type { PracticalBriefExamProps } from '@/types/practicalBriefTypes'

export default function PracticalExamRunner({ exam }: PracticalBriefExamProps) {
  const session = usePracticalExamState(exam)
  if (session.stage === 'brief') return <ExamArkuszBrief exam={exam} onStart={session.handleStart} />
  if (session.stage === 'results' && session.state.result) {
    return <ExamResults title={exam.title} result={session.state.result} answers={session.answers} onRestart={session.handleRestart} />
  }
  return <PracticalExamWorkspace exam={exam} session={session} />
}
