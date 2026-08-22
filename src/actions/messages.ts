"use server"

import { revalidatePath } from "next/cache"
import { ensureAdmin } from "@/helpers/ensureAdmin"
import { markMessageAsRead } from "@/server/queries"
import { fromErrorToFormState, toFormState } from "@/helpers/toFormState"
import { FormState } from "@/types/actionTypes"

export async function markMessageAsReadAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await ensureAdmin()

    const messageId = Number(formData.get("messageId"))

    if (!messageId || isNaN(messageId)) {
      return toFormState("ERROR", "Nieprawidłowe ID wiadomości")
    }

    await markMessageAsRead(messageId)

    revalidatePath("/admin/messages")

    return toFormState("SUCCESS", "Wiadomość oznaczona jako przeczytana")
  } catch (error) {
    return fromErrorToFormState(error)
  }
}
