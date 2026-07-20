import type {
  LearningPlanRow,
  LearningPlanConceptRow,
} from '@/server/db/schema'

export type PlanGoalType = 'exam' | 'custom'
export type PlanStatus = 'active' | 'completed' | 'archived'
export type PaceStatus = 'ahead' | 'on_track' | 'behind'
export type ConceptSource = 'category' | 'custom' | 'ai' | 'procedure'

export interface PlanWithConcepts extends LearningPlanRow {
  concepts: LearningPlanConceptRow[]
}

export interface ConceptProgress {
  id: string
  categoryKey: string | null
  procedureId: string | null
  label: string
  source: ConceptSource
  targetMinutes: number
  sortOrder: number
  completedAt: string | null
  autoMinutes: number
  manualMinutes: number
}

export interface DailySuggestion {
  conceptId: string
  label: string
  categoryKey: string | null
  procedureId: string | null
  remainingMinutesToday: number
}

export interface PlanProgress {
  plan: {
    id: string
    courseSlug: string
    name: string
    goalType: PlanGoalType
    focusCategoryKey: string | null
    focusLabel: string | null
    dueDate: string
    minutesPerDay: number
    studyDays: number[]
    status: PlanStatus
    createdAt: string
  }
  concepts: ConceptProgress[]
  plannedTotalMinutes: number
  expectedMinutesToDate: number
  actualMinutes: number
  attributedMinutes: number
  unattributedMinutes: number
  todayMinutes: number
  paceStatus: PaceStatus
  streak: number
  daysLeft: number
  todayIsStudyDay: boolean
  suggestion: DailySuggestion | null
}

export interface ActivityEntry {
  date: Date
  minutes: number
  categoryKey: string | null
  procedureId: string | null
  conceptId: string | null
}

export interface ConceptTopicGroup {
  key: 'lectures' | 'seminars' | 'selfStudy'
  label: string
  topics: string[]
}

export interface ConceptCatalogEntry {
  categoryKey: string
  label: string
  questionCount: number
  topicGroups: ConceptTopicGroup[]
}

export interface ExamDatePreset {
  label: string
  dateISO: string
}

export interface SelectedConcept {
  categoryKey: string | null
  procedureId?: string | null
  label: string
  source: 'category' | 'custom' | 'procedure'
  targetMinutes: number
}

export interface ProcedureOption {
  id: string
  name: string
}

export interface PlanWizardProps {
  courses: { slug: string; name: string }[]
  catalogByCourse: Record<string, ConceptCatalogEntry[]>
  examPresetsByCourse: Record<string, ExamDatePreset[]>
  proceduresByCourse: Record<string, ProcedureOption[]>
  initialFocus?: string | null
}
