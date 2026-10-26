"use server"

import { auth } from '@clerk/nextjs/server'
import { after } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { checkCourseAccessAction } from '@/actions/course-actions'
import { GradePracticalExamSchema } from '@/server/schema'
import { getPracticalExamById } from '@/lib/praktycznyUtils'
import { gradePracticalExam } from '@/helpers/praktycznyGrading'
import { getGeneratedPracticalExamById, insertStudyLog } from '@/server/queries'
import { toFormState, fromErrorToFormState } from '@/helpers/toFormState'
import { toPracticalExamErrorState } from '@/helpers/toPracticalExamErrorState'
import type { PracticalExamState } from '@/types/praktycznyTypes'
import { onStudyLogRecorded } from '@/server/memory/extractStudyLog'

export async function gradePracticalExamAction(
  prevState: PracticalExamState,
  formData: FormData
): Promise<PracticalExamState> {
  try {
    const { userId } = await auth()
    if (!userId) return toPracticalExamErrorState("Sesja wygasła. Zaloguj się ponownie.")

    const access = await checkCourseAccessAction("opiekun-medyczny")
    if (!access.hasAccess) {
      return toPracticalExamErrorState("Brak dostępu do kursu opiekun medyczny.")
    }

    const rateLimit = await checkRateLimit(userId, "egzamin:grade")
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      return toPracticalExamErrorState(`Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`)
    }

    const examId = formData.get("examId") as string
    const answers = formData.get("answers") as string
    const timeSpent = formData.get("timeSpent") as string

    const validationResult = GradePracticalExamSchema.safeParse({ examId, answers, timeSpent })
    if (!validationResult.success) {
      return { ...fromErrorToFormState(validationResult.error), result: null }
    }

    let exam = getPracticalExamById(validationResult.data.examId)
    if (!exam) {
      exam = await getGeneratedPracticalExamById(validationResult.data.examId, userId)
    }
    if (!exam) {
      return toPracticalExamErrorState("Nie znaleziono arkusza egzaminacyjnego.")
    }

    const result = gradePracticalExam(exam, validationResult.data.answers)

    // Ledger entry: practical exam time counts as learning activity. The
    // official MED.14 practical part allows 120 min — clamp against runaway
    // timers from abandoned tabs.
    const studiedMinutes = Math.min(
      Math.max(1, Math.round(validationResult.data.timeSpent / 60)),
      120
    )
    try {
      const studyLogId = await insertStudyLog({
        userId,
        minutes: studiedMinutes,
        source: "practical-exam",
        categoryKey: "opiekun-medyczny",
        note: `Egzamin praktyczny: ${exam.title || exam.id} — wynik ${result.percent}%, ${result.passed ? "zaliczony" : "niezaliczony"}`.slice(0, 500),
      })
      after(() => onStudyLogRecorded({ userId, studyLogId }))
    } catch (error) {
      console.error("Failed to log practical exam study time:", error)
    }

    return {
      ...toFormState("SUCCESS", result.passed
        ? `Zaliczono! Wynik: ${result.percent}%`
        : `Wynik: ${result.percent}%. Próg zaliczenia to ${75}%.`),
      result,
    }
  } catch {
    return toPracticalExamErrorState("Wystąpił błąd podczas sprawdzania arkusza.")
  }
}

