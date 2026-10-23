import type { ReactNode, RefObject } from 'react'
import type { WolfekGaze } from '@/types/wolfekTypes'

export interface ExamHubLayoutProps { theory: ReactNode; practice: ReactNode }
export interface ExamWolfekProps { active: string }
export interface ExamWolfekAvatarProps extends ExamWolfekProps {
  avatarRef: RefObject<HTMLDivElement | null>
  gaze: WolfekGaze
}
export interface ExamWolfekReviewProps extends ExamWolfekAvatarProps { replay: number }
export interface ExamHubContentProps { card: ExamHubCard }
export interface ExamHubStatsProps { stats: ExamHubStat[] }

export interface ExamHubProps {
  categoryCount: number
  questionCount: number
  categoryNames: string[]
  practicalExamCount: number
  sessionNames: string[]
  hasPracticalAccess: boolean
}

export interface ExamHubStat {
  icon: ReactNode
  value: string
  label: string
}

export interface ExamHubCard {
  href: string
  title: string
  subtitle: string
  description: string
  image: string
  disabled?: boolean
  stats: ExamHubStat[]
  preview?: { icon: ReactNode; label: string; items: string[]; limit: number }
  meta: { icon: ReactNode; label: string }[]
  cta: string
}

