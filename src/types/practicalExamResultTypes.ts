import type { ExamAnswers, ExamResult, FieldResult, FormResult, ProcedureResult } from '@/types/praktycznyTypes'

export type ExamResultTab = 'summary' | 'procedures' | 'forms'
export type ExamResultScoreStatus = 'full' | 'partial' | 'none' | 'unscored'
export interface ExamResultTarget { tab: ExamResultTab; id: string }
export interface ExamResultSection extends ExamResultTarget { title: string; earned: number; max: number }
export interface ExamResultsProps { title: string; result: ExamResult; answers: ExamAnswers; onRestart: () => void }
export interface ExamResultActionsProps { onRestart: () => void }
export interface ExamResultSummaryProps { result: ExamResult }
export interface ExamResultOverviewProps { sections: ExamResultSection[]; onReview: (target: ExamResultTarget) => void }
export interface ExamResultScoreProps { earned: number; max: number }
export interface ExamResultAnswerListProps { label: string; items: string[]; emptyText: string }
export interface ExamResultFieldProps { field: FieldResult; formId: string; answers: ExamAnswers }
export interface ExamResultFormProps { form: FormResult; answers: ExamAnswers }
export interface ExamResultProcedureProps { procedure: ProcedureResult }
export interface ExamResultReviewProps {
  result: ExamResult; answers: ExamAnswers; active: string
  procedureId: string; formId: string
  onProcedureChange: (id: string) => void; onFormChange: (id: string) => void
}
export interface ExamResultHelpProps { result: ExamResult; activeTab: string; onReview: (target: ExamResultTarget) => void }
export interface ExamResultHelp { text: string; target: ExamResultTarget | null }
