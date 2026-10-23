import type { PublicExam } from '@/types/praktycznyTypes'

export interface PracticalBriefExamProps { exam: PublicExam }
export interface PracticalBriefProps extends PracticalBriefExamProps { onStart: () => void }
export interface PracticalBriefHelpProps extends PracticalBriefExamProps {
  activeTab: string
  onNavigate: (tab: string) => void
}
