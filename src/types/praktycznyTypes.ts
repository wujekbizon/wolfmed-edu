export const PRACTICAL_PASSING_PERCENT = 75

export interface PracticalPatient {
  name: string
  pesel: string
  ward: string
  description: string
}

export interface AssessedTask {
  title: string
  items: string[]
}

export interface ValueField {
  kind: 'value'
  id: string
  label: string
  match?: 'text' | 'number' | 'date'
  accepted?: string[]
  range?: { min?: number; max?: number }
  unit?: string
  hint?: string
}

export interface AcceptedAnswer {
  id: string
  canonical: string
  synonyms?: string[]
}

export interface ListField {
  kind: 'list'
  id: string
  label: string
  minRequired: number
  lines: number
  acceptedAnswers: AcceptedAnswer[]
  hint?: string
}

export type FormField = ValueField | ListField

export interface ExamForm {
  id: string
  title: string
  intro?: string
  fields: FormField[]
}

export interface PracticalExam {
  id: string
  title: string
  year: number
  session: string
  arkusz: string
  durationMinutes: number
  taskSummary: string
  assessedTasks: AssessedTask[]
  patient: PracticalPatient
  forms: ExamForm[]
}

export type PublicValueField = Omit<ValueField, 'accepted' | 'range'>
export type PublicListField = Omit<ListField, 'acceptedAnswers'>
export type PublicFormField = PublicValueField | PublicListField

export interface PublicExamForm {
  id: string
  title: string
  intro?: string
  fields: PublicFormField[]
}

export type PublicExam = Omit<PracticalExam, 'forms'> & {
  forms: PublicExamForm[]
}

export type ExamAnswers = Record<string, string | string[]>

export interface FieldResult {
  fieldId: string
  label: string
  kind: FormField['kind']
  earned: number
  max: number
  modelAnswers: string[]
  matchedAnswerIds: string[]
}

export interface FormResult {
  formId: string
  title: string
  earned: number
  max: number
  fields: FieldResult[]
}

export interface ExamResult {
  forms: FormResult[]
  earned: number
  max: number
  percent: number
  passed: boolean
}

export interface PracticalExamState {
  status: 'UNSET' | 'SUCCESS' | 'ERROR'
  message: string
  timestamp: number
  result: ExamResult | null
}

export const EMPTY_PRACTICAL_EXAM_STATE: PracticalExamState = {
  status: 'UNSET',
  message: '',
  timestamp: Date.now(),
  result: null,
}
