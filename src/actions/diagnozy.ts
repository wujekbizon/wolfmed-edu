"use server"

import { auth } from "@clerk/nextjs/server"
import { checkRateLimit } from "@/lib/rateLimit"
import { hasDiagnozyAccess } from "@/helpers/hasDiagnozyAccess"
import { MarkDiagnozaCompletedSchema } from "@/server/schema"
import { getDiagnozaBySlug, insertDiagnozaCompletion } from "@/server/queries"
import type { DiagnozaFillData } from "@/types/diagnozyTypes"

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
