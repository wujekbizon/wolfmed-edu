import ExamHubLayout from '@/components/ExamHubLayout'
import ExamHubContent from '@/components/ExamHubContent'
import { getTheoryExamPresentation } from '@/helpers/getTheoryExamPresentation'
import { getPracticalExamPresentation } from '@/helpers/getPracticalExamPresentation'
import type { ExamHubProps } from '@/types/examHubTypes'

export default function TestyEgzaminyHub(props: ExamHubProps) {
  return (
    <ExamHubLayout
      theory={<ExamHubContent card={getTheoryExamPresentation(props)} />}
      practice={<ExamHubContent card={getPracticalExamPresentation(props)} />}
    />
  )
}
