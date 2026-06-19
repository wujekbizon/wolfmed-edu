"use server"

import { auth } from "@clerk/nextjs/server"
import { checkRateLimit } from "@/lib/rateLimit"
import { checkCourseAccessAction } from "@/actions/course-actions"
import { GradePracticalExamSchema } from "@/server/schema"
import { getPracticalExamById } from "@/lib/praktycznyUtils"
import { gradePracticalExam } from "@/helpers/praktycznyGrading"
import type { ExamAnswers, PracticalExamState } from "@/types/praktycznyTypes"

function errorState(message: string): PracticalExamState {
  return { status: "ERROR", message, timestamp: Date.now(), result: null }
}

export async function gradePracticalExamAction(
  prevState: PracticalExamState,
  formData: FormData
): Promise<PracticalExamState> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const access = await checkCourseAccessAction("opiekun-medyczny")
  if (!access.hasAccess) {
    return errorState("Brak dostępu do kursu opiekun medyczny.")
  }

  const rateLimit = await checkRateLimit(userId, "egzamin:grade")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return errorState(`Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`)
  }

  const examId = formData.get("examId") as string
  const answers = formData.get("answers") as string
  const timeSpent = formData.get("timeSpent") as string

  const validationResult = GradePracticalExamSchema.safeParse({ examId, answers, timeSpent })
  if (!validationResult.success) {
    return errorState("Nie udało się sprawdzić arkusza. Spróbuj ponownie.")
  }

  try {
    const exam = getPracticalExamById(validationResult.data.examId)
    if (!exam) {
      return errorState("Nie znaleziono arkusza egzaminacyjnego.")
    }

    const parsedAnswers: ExamAnswers = JSON.parse(validationResult.data.answers)
    const result = gradePracticalExam(exam, parsedAnswers)

    return {
      status: "SUCCESS",
      message: result.passed
        ? `Zaliczono! Wynik: ${result.percent}%`
        : `Wynik: ${result.percent}%. Próg zaliczenia to ${75}%.`,
      timestamp: Date.now(),
      result,
    }
  } catch {
    return errorState("Wystąpił błąd podczas sprawdzania arkusza.")
  }
}
