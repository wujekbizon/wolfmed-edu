"use server"

import crypto from "crypto"
import { auth } from "@clerk/nextjs/server"
import { checkRateLimit } from "@/lib/rateLimit"
import { checkCourseAccessAction, checkPremiumAccessAction } from "@/actions/course-actions"
import { GradePracticalExamSchema, GeneratedPracticalExamSchema } from "@/server/schema"
import { getPracticalExamById } from "@/lib/praktycznyUtils"
import { gradePracticalExam } from "@/helpers/praktycznyGrading"
import { executeToolLocally } from "@/server/tools/executor"
import { saveGeneratedPracticalExam, getGeneratedPracticalExamById } from "@/server/queries"
import { toFormState, fromErrorToFormState } from "@/helpers/toFormState"
import type { FormState } from "@/types/actionTypes"
import type { ExamAnswers, PracticalExam, PracticalExamState } from "@/types/praktycznyTypes"

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
    let exam = getPracticalExamById(validationResult.data.examId)
    if (!exam) {
      exam = await getGeneratedPracticalExamById(validationResult.data.examId, userId)
    }
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

export async function generatePracticalExamAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const access = await checkCourseAccessAction("opiekun-medyczny")
  if (!access.hasAccess) {
    return toFormState("ERROR", "Brak dostępu do kursu opiekun medyczny.")
  }

  const isPremium = await checkPremiumAccessAction()
  if (!isPremium) {
    return toFormState("ERROR", "Funkcja dostępna tylko dla użytkowników premium.")
  }

  const rateLimit = await checkRateLimit(userId, "egzamin:generate")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState("ERROR", `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`)
  }

  try {
    const generated = await executeToolLocally("egzamin_praktyczny_tool", {})

    let parsed: unknown
    try {
      parsed = JSON.parse(generated.content)
    } catch {
      return toFormState("ERROR", "Nie udało się wygenerować arkusza. Spróbuj ponownie.")
    }

    const validationResult = GeneratedPracticalExamSchema.safeParse(parsed)
    if (!validationResult.success) {
      return toFormState("ERROR", "Wygenerowany arkusz był nieprawidłowy. Spróbuj ponownie.")
    }

    // Shape is guaranteed by GeneratedPracticalExamSchema above; cast mirrors the
    // read side, where examJson is deserialized from jsonb as PracticalExam.
    const exam = {
      ...validationResult.data,
      id: crypto.randomUUID(),
      year: validationResult.data.year ?? new Date().getFullYear(),
    } as PracticalExam

    const examId = await saveGeneratedPracticalExam(userId, exam)

    return {
      ...toFormState("SUCCESS", "Nowy arkusz został wygenerowany!"),
      examId,
    }
  } catch (error) {
    return fromErrorToFormState(error)
  }
}
