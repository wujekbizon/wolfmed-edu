"use server"

import { auth } from "@clerk/nextjs/server"
import { checkRateLimit } from "@/lib/rateLimit"
import { hasDiagnozyAccess } from "@/helpers/hasDiagnozyAccess"
import { MarkDiagnozaCompletedSchema, SubmitDiagnozyExamSchema } from "@/server/schema"
import {
  getDiagnozaBySlug,
  getDiagnozyForExam,
  insertDiagnozaCompletion,
  insertDiagnozyExamAttempt,
} from "@/server/queries"
import { buildDiagnozyExam } from "@/helpers/buildDiagnozyExam"
import { gradeDiagnozyExam } from "@/helpers/gradeDiagnozyExam"
import type {
  BodyZoneAssignments,
  DiagnozaFillData,
  DiagnozyExamAnswers,
  DiagnozyExamPayload,
  DiagnozyExamResult,
} from "@/types/diagnozyTypes"

type MarkCompletedResult =
  | { status: "SUCCESS" }
  | { status: "ERROR"; message: string }

type FillDataResult =
  | { status: "SUCCESS"; data: DiagnozaFillData }
  | { status: "ERROR"; message: string }

// Lists for the form once the user picks a diagnosis formulation in the
// Wypełnij select — fetched on demand so the client never loads all records.
export async function getDiagnozaFillDataAction(
  slug: string
): Promise<FillDataResult> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const hasAccess = await hasDiagnozyAccess()
  if (!hasAccess) {
    return { status: "ERROR", message: "Brak dostępu do kursu pielęgniarstwo." }
  }

  const validationResult = MarkDiagnozaCompletedSchema.safeParse({ slug })
  if (!validationResult.success) {
    return { status: "ERROR", message: "Nieprawidłowy identyfikator diagnozy." }
  }

  const diagnoza = await getDiagnozaBySlug(validationResult.data.slug)
  if (!diagnoza) {
    return { status: "ERROR", message: "Nie znaleziono diagnozy." }
  }

  return {
    status: "SUCCESS",
    data: {
      celeOpieki: diagnoza.celeOpieki,
      interwencje: diagnoza.interwencje,
      oczekiwaneWyniki: diagnoza.oczekiwaneWyniki,
    },
  }
}

export async function markDiagnozaCompletedAction(
  slug: string
): Promise<MarkCompletedResult> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const hasAccess = await hasDiagnozyAccess()
  if (!hasAccess) {
    return { status: "ERROR", message: "Brak dostępu do kursu pielęgniarstwo." }
  }

  const rateLimit = await checkRateLimit(userId, "diagnozy:complete")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return {
      status: "ERROR",
      message: `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`,
    }
  }

  const validationResult = MarkDiagnozaCompletedSchema.safeParse({ slug })
  if (!validationResult.success) {
    return { status: "ERROR", message: "Nieprawidłowy identyfikator diagnozy." }
  }

  try {
    const diagnoza = await getDiagnozaBySlug(validationResult.data.slug)
    if (!diagnoza) {
      return { status: "ERROR", message: "Nie znaleziono diagnozy." }
    }

    await insertDiagnozaCompletion(userId, validationResult.data.slug)
    return { status: "SUCCESS" }
  } catch {
    return { status: "ERROR", message: "Wystąpił błąd. Spróbuj ponownie." }
  }
}

type StartExamResult =
  | { status: "SUCCESS"; exam: DiagnozyExamPayload }
  | { status: "ERROR"; message: string }

type SubmitExamResult =
  | { status: "SUCCESS"; result: DiagnozyExamResult }
  | { status: "ERROR"; message: string }

// Draws a random published diagnosis and builds the option pools server-side;
// the payload carries no correctness flags.
export async function startDiagnozyExamAction(): Promise<StartExamResult> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const hasAccess = await hasDiagnozyAccess()
  if (!hasAccess) {
    return { status: "ERROR", message: "Brak dostępu do kursu pielęgniarstwo." }
  }

  const all = await getDiagnozyForExam()
  if (all.length === 0) {
    return { status: "ERROR", message: "Brak dostępnych diagnoz egzaminacyjnych." }
  }

  const drawn = all[Math.floor(Math.random() * all.length)]!
  const siblings = all.filter((diagnoza) => diagnoza.slug !== drawn.slug)

  return { status: "SUCCESS", exam: buildDiagnozyExam(drawn, siblings) }
}

export async function submitDiagnozyExamAction(payload: {
  slug: string
  answers: DiagnozyExamAnswers
  zones: BodyZoneAssignments
  timeSpent: number
}): Promise<SubmitExamResult> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const hasAccess = await hasDiagnozyAccess()
  if (!hasAccess) {
    return { status: "ERROR", message: "Brak dostępu do kursu pielęgniarstwo." }
  }

  const rateLimit = await checkRateLimit(userId, "diagnozy:exam:submit")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return {
      status: "ERROR",
      message: `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`,
    }
  }

  const validationResult = SubmitDiagnozyExamSchema.safeParse(payload)
  if (!validationResult.success) {
    return { status: "ERROR", message: "Nieprawidłowe odpowiedzi egzaminacyjne." }
  }

  try {
    const diagnoza = await getDiagnozaBySlug(validationResult.data.slug)
    if (!diagnoza) {
      return { status: "ERROR", message: "Nie znaleziono diagnozy." }
    }

    const result = gradeDiagnozyExam(
      diagnoza,
      validationResult.data.answers,
      validationResult.data.zones ?? {}
    )
    await insertDiagnozyExamAttempt({
      userId,
      diagnozaSlug: diagnoza.slug,
      score: result.score,
      stepScores: result.steps.map(({ field, scorePercent }) => ({ field, scorePercent })),
      timeSpent: Math.round(validationResult.data.timeSpent),
      passed: result.passed,
    })

    return { status: "SUCCESS", result }
  } catch {
    return { status: "ERROR", message: "Wystąpił błąd podczas sprawdzania egzaminu." }
  }
}
