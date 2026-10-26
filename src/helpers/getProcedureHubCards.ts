import { COURSE_PROCEDURE_CARDS } from '@/constants/courseProcedureCards'
import type { ProcedureHubEnrollment } from '@/types/procedureHubTypes'

export function getProcedureHubCards(courses: readonly ProcedureHubEnrollment[]) {
  return COURSE_PROCEDURE_CARDS.filter(card => courses.some(course => course.slug === card.slug))
}
