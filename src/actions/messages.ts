"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { markMessageAsRead } from "@/server/queries"
import { requireAdmin } from "@/lib/adminHelpers"
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

    await requireAdmin()

    const messageId = Number(formData.get("messageId"))

    if (!messageId || isNaN(messageId)) {
      return toFormState("ERROR", "Nieprawidłowe ID wiadomości")
    }

    await markMessageAsRead(messageId)

    revalidatePath("/blog/admin/messages")
    revalidateTag('message-stats', 'max')

    return toFormState("SUCCESS", "Wiadomość oznaczona jako przeczytana")
  } catch (error) {
    return fromErrorToFormState(error)
  }
}
