"use server"

import crypto from 'crypto'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { checkCourseAccessAction, checkPremiumAccessAction } from '@/actions/course-actions'
import { GeneratedPracticalExamSchema } from '@/server/schema'
import { executeToolLocally } from '@/server/tools/executor'
import { saveGeneratedPracticalExam } from '@/server/queries'
import { toFormState, fromErrorToFormState } from '@/helpers/toFormState'
import type { FormState } from '@/types/actionTypes'
import type { PracticalExam } from '@/types/praktycznyTypes'

export async function generatePracticalExamAction(
  formState: FormState,
  formData: FormData
) {
  try {
    const { userId } = await auth()
    if (!userId) return toFormState("ERROR", "Sesja wygasła. Zaloguj się ponownie.")

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
