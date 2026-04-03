"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { markMessageAsRead } from "@/server/queries"
import { fromErrorToFormState, toFormState } from "@/helpers/toFormState"
import { FormState } from "@/types/actionTypes"

export async function markMessageAsReadAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return toFormState("ERROR", "Nieautoryzowany dostęp")
    }

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
