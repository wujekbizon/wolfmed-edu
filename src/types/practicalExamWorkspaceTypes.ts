import type { RefObject } from 'react'
import type { FormState } from '@/types/actionTypes'
import type { AssessedTask, PublicExam, PublicExamForm, PublicFormField, PublicChoiceField, PublicListField, PublicValueField } from '@/types/praktycznyTypes'
import type { usePracticalExamState } from '@/hooks/usePracticalExamState'

export type PracticalExamStage = 'brief' | 'exam' | 'results'
export interface PracticalExamValidationErrorsProps { formState: FormState }
export type PracticalExamSession = ReturnType<typeof usePracticalExamState>
export interface PracticalExamWorkspaceProps { exam: PublicExam; session: PracticalExamSession }
export interface PracticalExamTimerProps {
  durationMinutes: number
  onTimeUp: () => void
  startTime: number
  isSubmitting: boolean
}
export interface PracticalExamNavigationProps { exam: PublicExam; active: number; onSelect: (index: number) => void }
export interface PracticalExamFooterProps { active: number; total: number; pending: boolean; onSelect: (index: number) => void }
export interface PracticalExamTaskProps { task: AssessedTask; onOrderChange: (order: string[]) => void }
export interface PracticalExamSectionsProps extends PracticalExamWorkspaceProps { active: number; formRef: RefObject<HTMLFormElement | null> }
export interface PracticalExamCaseProps { exam: PublicExam }
export interface PracticalExamCaseDialogProps extends PracticalExamCaseProps { onClose: () => void }
export interface ExamFormCardProps {
  formState: FormState
  exam: PublicExam; form: PublicExamForm; index: number
  answers: PracticalExamSession['answers']
  onValueChange: (key: string, value: string) => void
  onListLineChange: (key: string, line: number, value: string) => void
  onChoiceToggle: (key: string, option: string) => void
}
export interface ExamFieldProps {
  formState: FormState
  field: PublicFormField; fieldKey: string; inputId: string
  answers: PracticalExamSession['answers']
  onValueChange: ExamFormCardProps['onValueChange']
  onListLineChange: ExamFormCardProps['onListLineChange']
  onChoiceToggle: ExamFormCardProps['onChoiceToggle']
}
export type ExamValueFieldProps = Omit<ExamFieldProps, 'field'> & { field: PublicValueField }
export type ExamListFieldProps = Omit<ExamFieldProps, 'field'> & { field: PublicListField }
export type ExamChoiceFieldProps = Omit<ExamFieldProps, 'field'> & { field: PublicChoiceField }
