"use server"

import { fromErrorToFormState, toFormState } from "@/helpers/toFormState"
import { FormState } from "@/types/actionTypes"
import { auth } from "@clerk/nextjs/server"
import { UserCellsListSchema } from "@/server/schema"
import { checkRateLimit } from "@/lib/rateLimit"
import { getUserCellsList, saveUserCellsList } from "@/server/queries"
import { UserCellsList } from "@/types/cellTypes"

export async function saveCellsAction(
  _formState: FormState,
  formData: FormData
): Promise<FormState> {
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
  const rawVersion = formData.get("version")
  const rawClientRevision = formData.get("clientRevision")

  let parsed
  try {
    parsed = UserCellsListSchema.parse({
      order: JSON.parse(rawOrder),
      cells: JSON.parse(rawCells),
    })
  } catch (err) {
    return fromErrorToFormState(err)
  }

  const expectedVersion = rawVersion === null || rawVersion === "" ? null : Number(rawVersion)
  const clientRevision = Number(rawClientRevision)
  if (
    expectedVersion !== null &&
    (!Number.isInteger(expectedVersion) || expectedVersion < 0)
  ) {
    return toFormState("ERROR", "Nieprawidłowa wersja planszy")
  }
  if (!Number.isInteger(clientRevision) || clientRevision < 0) {
    return toFormState("ERROR", "Nieprawidłowa lokalna wersja planszy")
  }

  try {
    const result = await saveUserCellsList(
      userId,
      parsed.cells,
      parsed.order,
      expectedVersion
    )

    if (result.status === "conflict") {
      return {
        ...toFormState(
          "ERROR",
          "Plansza została zmieniona w innej karcie lub na innym urządzeniu"
        ),
        values: {
          conflict: true,
          serverVersion: result.current?.version ?? null,
          serverOrder: JSON.stringify(result.current?.order ?? []),
          serverCells: JSON.stringify(result.current?.cells ?? {}),
          clientRevision,
        },
      }
    }

    return {
      ...toFormState("SUCCESS", "Zapisano pomyślnie"),
      values: { serverVersion: result.version, clientRevision },
    }
  } catch (err) {
    return fromErrorToFormState(err)
  }
}

export const syncCellsAction = async (): Promise<{
  success: boolean
  data?: UserCellsList
  error?: string
}> => {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const fetchedCells = await getUserCellsList(userId)
    if (!fetchedCells) {
      return { success: false, error: "No saved cells found" }
    }

    return { success: true, data: fetchedCells }
  } catch (err) {
    console.error("Sync error:", err)
    return { success: false, error: "Unexpected error" }
  }
}
