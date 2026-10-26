import type { ExamAnswers, PublicExam } from '@/types/praktycznyTypes'

export function buildInitialPracticalExamAnswers(exam: PublicExam): ExamAnswers {
  const answers: ExamAnswers = {}
  for (const form of exam.forms) {
    for (const field of form.fields) {
      const key = `${form.id}:${field.id}`
      if (field.kind === 'list') answers[key] = Array<string>(field.lines).fill('')
      else if (field.kind === 'choice') answers[key] = []
      else answers[key] = ''
    }
  }
  exam.assessedTasks.forEach((task, index) => {
    if (task.type === 'procedure') answers[`procedure:${index}`] = []
  })
  return answers
}

