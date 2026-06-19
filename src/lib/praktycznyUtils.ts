import examData from '../../data/egzaminPraktyczny.json'
import type {
  PracticalExam,
  PublicExam,
  PublicExamForm,
  PublicFormField,
} from '@/types/praktycznyTypes'

const exams = examData as PracticalExam[]

export function getAllPracticalExams(): PracticalExam[] {
  return exams
}

export function getPracticalExamById(id: string): PracticalExam | null {
  return exams.find((exam) => exam.id === id) ?? null
}

export function toPublicExam(exam: PracticalExam): PublicExam {
  const forms: PublicExamForm[] = exam.forms.map((form) => ({
    id: form.id,
    title: form.title,
    ...(form.intro ? { intro: form.intro } : {}),
    fields: form.fields.map((field): PublicFormField => {
      if (field.kind === 'list') {
        const { acceptedAnswers, ...rest } = field
        return rest
      }
      if (field.kind === 'choice') {
        return {
          ...field,
          groups: field.groups.map((group) => ({
            ...group,
            options: group.options.map(({ correct, ...opt }) => opt),
          })),
        }
      }
      const { accepted, range, ...rest } = field
      return rest
    }),
  }))

  return { ...exam, forms }
}

export function getAllPublicPracticalExams(): PublicExam[] {
  return exams.map(toPublicExam)
}

export function getPublicPracticalExamById(id: string): PublicExam | null {
  const exam = getPracticalExamById(id)
  return exam ? toPublicExam(exam) : null
}
