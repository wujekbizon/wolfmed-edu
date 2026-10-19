import type { LucideIcon } from 'lucide-react'

export interface StatsRowProps {
  totalQuestions: number
  testsAttempted: number
  totalScore: number
  enrolledCount: number
}

export interface StatCardProps {
  icon: LucideIcon
  value?: number
  label: string
  accent?: boolean
  iconTone?: 'lavender' | 'rose'
}
