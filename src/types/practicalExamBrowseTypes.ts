import type { PublicExam } from '@/types/praktycznyTypes'

export interface PracticalExamBrowseCriteria {
  search: string
  year: string
  sort: string
}
export interface PracticalExamBrowserProps { exams: PublicExam[] }
export interface PracticalExamToolbarProps {
  criteria: PracticalExamBrowseCriteria
  years: number[]
  onChange: (patch: Partial<PracticalExamBrowseCriteria>) => void
}
