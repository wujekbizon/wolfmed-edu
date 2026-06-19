export const PRACTICAL_PASSING_PERCENT = 75

export interface PracticalPatient {
  name: string
  pesel: string
  ward: string
  description: string
}

export interface AssessedTask {
  type: 'equipment' | 'procedure'
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

export interface ChoiceOption {
  id: string
  label: string
  correct: boolean
}

export interface ChoiceGroup {
  id: string
  label: string
  minRequired: number
  options: ChoiceOption[]
}

export interface ChoiceField {
  kind: 'choice'
  id: string
  label: string
  intro?: string
  groups: ChoiceGroup[]
}

export type FormField = ValueField | ListField | ChoiceField

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
  image?: string
  durationMinutes: number
  taskSummary: string
  assessedTasks: AssessedTask[]
  patient: PracticalPatient
  forms: ExamForm[]
}

export type PublicValueField = Omit<ValueField, 'accepted' | 'range'>
export type PublicListField = Omit<ListField, 'acceptedAnswers'>
export type PublicChoiceOption = Omit<ChoiceOption, 'correct'>
export type PublicChoiceGroup = Omit<ChoiceGroup, 'options'> & { options: PublicChoiceOption[] }
export type PublicChoiceField = Omit<ChoiceField, 'groups'> & { groups: PublicChoiceGroup[] }
export type PublicFormField = PublicValueField | PublicListField | PublicChoiceField

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
  userSelections?: string[]
}

export interface FormResult {
  formId: string
  title: string
  earned: number
  max: number
  fields: FieldResult[]
}

export interface ProcedureResult {
  taskIndex: number
  title: string
  earned: number
  max: number
  correctSteps: string[]
  userSteps: string[]
}

export interface ExamResult {
  forms: FormResult[]
  procedures: ProcedureResult[]
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
