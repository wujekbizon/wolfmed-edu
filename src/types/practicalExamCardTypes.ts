import type { PublicExam } from '@/types/praktycznyTypes'

export interface PracticalExamAICardProps {
  isPremium?: boolean
  action?: (formData: FormData) => void
}

export type PracticalExamCardProps =
  | { variant: 'exam'; exam: PublicExam }
  | ({ variant: 'ai' } & PracticalExamAICardProps)

export interface PracticalExamHeroProps { image: string; title: string; eager?: boolean }
export interface PracticalExamCardSkeletonProps { variant?: 'exam' | 'ai' }
