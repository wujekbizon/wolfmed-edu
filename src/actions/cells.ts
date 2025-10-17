'use server'

import { db } from "@/server/db/index"
import { fromErrorToFormState, toFormState } from "@/helpers/toFormState"
import { FormState } from "@/types/actionTypes"
import { auth } from "@clerk/nextjs/server"
import { UserCellsListSchema } from "@/server/schema"
import {
  checkUserCellsList,
  createUserCellsList,
  updateUserCellsList,
} from "@/server/queries"

export async function saveCellsAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

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
