import type { ExamResult } from '@/types/praktycznyTypes'
import type { ExamResultSection } from '@/types/practicalExamResultTypes'

export function getExamResultSections(result: ExamResult): ExamResultSection[] {
  return [
    ...result.procedures.map((procedure): ExamResultSection => ({ tab: 'procedures', id: String(procedure.taskIndex), title: procedure.title, earned: procedure.earned, max: procedure.max })),
    ...result.forms.map((form): ExamResultSection => ({ tab: 'forms', id: form.formId, title: form.title, earned: form.earned, max: form.max })),
  ]
}
