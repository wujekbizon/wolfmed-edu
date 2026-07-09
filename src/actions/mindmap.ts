"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { checkRateLimit } from "@/lib/rateLimit"
import { toFormState, fromErrorToFormState } from "@/helpers/toFormState"
import {
  GenerateMindMapSchema,
  RenameMindMapSchema,
  DeleteMindMapSchema,
  MindMapNodeSchema,
} from "@/server/schema"
import {
  saveMindMap,
  getMindMapById,
  updateMindMapRoot,
  renameMindMap,
  deleteMindMap,
} from "@/server/queries"
import { generateTree } from "@/lib/mindmap/generateTree"
import { setNodeMastery, findNode } from "@/lib/mindmap/treeOps"
import type { FormState } from "@/types/actionTypes"
import type { MasteryLevel, MindMapNode } from "@/lib/mindmap/types"

const MASTERY_LEVELS: MasteryLevel[] = ["unseen", "learning", "mastered"]

export async function generateMindMapAction(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const parsed = GenerateMindMapSchema.safeParse({
    topic: formData.get("topic"),
    subjectId: formData.get("subjectId") ?? undefined,
  })
  if (!parsed.success) {
    return {
      ...toFormState("ERROR", "Popraw błędy w formularzu."),
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: { topic: (formData.get("topic") as string) ?? "" },
    }
  }

  const rateLimit = await checkRateLimit(userId, "mindmap:generate")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState("ERROR", `Limit generowania map na dziś wyczerpany. Spróbuj ponownie za ${resetMinutes} minut.`)
  }

  try {
    const { root, topicType } = await generateTree(parsed.data.topic)

    // Never trust the model output even after normalization.
    const validated = MindMapNodeSchema.safeParse(root)
    if (!validated.success) {
      return toFormState("ERROR", "Wygenerowana mapa była nieprawidłowa. Spróbuj ponownie.")
    }

    const mapId = await saveMindMap({
      userId,
      title: parsed.data.topic,
      topicType,
      root: validated.data as MindMapNode,
      ...(parsed.data.subjectId ? { subjectId: parsed.data.subjectId } : {}),
    })

    revalidatePath("/panel/mapy")
    return { ...toFormState("SUCCESS", "Mapa została wygenerowana!"), mapId }
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

export async function saveMindMapTreeAction(mapId: string, root: unknown): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const parsed = MindMapNodeSchema.safeParse(root)
  if (!parsed.success) return toFormState("ERROR", "Nieprawidłowa struktura mapy.")

  const map = await getMindMapById(mapId, userId)
  if (!map) return toFormState("ERROR", "Brak uprawnień.")

  const rateLimit = await checkRateLimit(userId, "mindmap:update")
  if (!rateLimit.success) return toFormState("ERROR", "Zbyt wiele zapisów. Spróbuj za chwilę.")

  try {
    await updateMindMapRoot(mapId, userId, parsed.data as MindMapNode)
    return toFormState("SUCCESS", "Zapisano.")
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

export async function updateNodeMasteryAction(
  mapId: string,
  nodeId: string,
  level: MasteryLevel
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  if (!MASTERY_LEVELS.includes(level)) {
    return toFormState("ERROR", "Nieprawidłowy poziom opanowania.")
  }

  const map = await getMindMapById(mapId, userId)
  if (!map) return toFormState("ERROR", "Brak uprawnień.")

  if (!findNode(map.root, nodeId)) {
    return toFormState("ERROR", "Nie znaleziono węzła.")
  }

  try {
    const nextRoot = setNodeMastery(map.root, nodeId, level)
    await updateMindMapRoot(mapId, userId, nextRoot)
    return toFormState("SUCCESS", "Zapisano.")
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

export async function renameMindMapAction(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const parsed = RenameMindMapSchema.safeParse({
    mapId: formData.get("mapId"),
    title: formData.get("title"),
  })
  if (!parsed.success) {
    return {
      ...toFormState("ERROR", "Popraw błędy w formularzu."),
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const map = await getMindMapById(parsed.data.mapId, userId)
  if (!map) return toFormState("ERROR", "Brak uprawnień.")

  try {
    await renameMindMap(parsed.data.mapId, userId, parsed.data.title)
    revalidatePath("/panel/mapy")
    return toFormState("SUCCESS", "Nazwa mapy została zmieniona.")
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

export async function deleteMindMapAction(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const parsed = DeleteMindMapSchema.safeParse({ mapId: formData.get("mapId") })
  if (!parsed.success) return toFormState("ERROR", "Nieprawidłowy identyfikator mapy.")

  const rateLimit = await checkRateLimit(userId, "mindmap:delete")
  if (!rateLimit.success) return toFormState("ERROR", "Zbyt wiele żądań. Spróbuj za chwilę.")

  const map = await getMindMapById(parsed.data.mapId, userId)
  if (!map) return toFormState("ERROR", "Brak uprawnień.")

  try {
    await deleteMindMap(parsed.data.mapId, userId)
    revalidatePath("/panel/mapy")
    return toFormState("SUCCESS", "Mapa została usunięta.")
  } catch (error) {
    return fromErrorToFormState(error)
  }
}
