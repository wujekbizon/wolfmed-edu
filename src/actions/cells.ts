"use server"

import { db } from "@/server/db/index"
import { fromErrorToFormState, toFormState } from "@/helpers/toFormState"
import { FormState } from "@/types/actionTypes"
import { auth, currentUser } from "@clerk/nextjs/server"
import { UserCellsListSchema } from "@/server/schema"
import { checkRateLimit } from "@/lib/rateLimit"
import {
  checkUserCellsList,
  createUserCellsList,
  getUserCellsList,
  updateUserCellsList,
} from "@/server/queries"
import { UserCellsList } from "@/types/cellTypes"

export async function saveCellsAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const rateLimit = await checkRateLimit(userId, "cells:update")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const rawOrder = formData.get("order") as string
  const rawCells = formData.get("cells") as string

  let parsed
  try {
    parsed = UserCellsListSchema.parse({
      order: JSON.parse(rawOrder),
      cells: JSON.parse(rawCells),
    })
  } catch (err) {
    return fromErrorToFormState(err)
  }

  try {
    await db.transaction(async (tx) => {
      const existing = await checkUserCellsList(userId)

      if (existing) {
        await updateUserCellsList(userId, parsed.cells, parsed.order)
      } else {
        await createUserCellsList(userId, parsed.cells, parsed.order)
      }
    })
  } catch (err) {
    return fromErrorToFormState(err)
  }

  return toFormState("SUCCESS", "Zapisano pomyślnie")
}

export const syncCellsAction = async (): Promise<{
  success: boolean
  data?: UserCellsList
  error?: string
}> => {
  try {
    const user = await currentUser()
    if (!user?.id) return { success: false, error: "Unauthorized" }

    const fetchedCells = await getUserCellsList(user.id)
    if (!fetchedCells) {
      return { success: false, error: "No saved cells found" }
    }

    return { success: true, data: fetchedCells }
  } catch (err) {
    console.error("Sync error:", err)
    return { success: false, error: "Unexpected error" }
  }
}
