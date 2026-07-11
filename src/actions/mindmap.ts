"use server"

import { auth } from "@clerk/nextjs/server"
import { checkRateLimit } from "@/lib/rateLimit"
import { checkPremiumAccessAction } from "@/actions/course-actions"
import { toFormState, fromErrorToFormState } from "@/helpers/toFormState"
import { GenerateMindMapSchema, MindMapNodeSchema } from "@/server/schema"
import { generateTree } from "@/lib/mindmap/generateTree"
import { collapseBelowDepth } from "@/lib/mindmap/treeOps"
import type { FormState } from "@/types/actionTypes"
import type { MindMapNode } from "@/lib/mindmap/types"

// A fresh map opens showing only the root and its first ring; deeper levels
// start collapsed so the user expands progressively.
const INITIAL_EXPANDED_DEPTH = 1

/**
 * Generates a mind-map tree from a free-text topic and returns it in
 * FormState.values.content as a JSON string. The tree is not persisted here —
 * the "Mapa Myśli" cell stores it in cell.content via the cells store, which is
 * saved through the existing userCellsList blob (same flow as plan/media cells).
 */
export async function generateMindMapAction(formState: FormState, formData: FormData): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const isPremium = await checkPremiumAccessAction()
  if (!isPremium) {
    return toFormState("ERROR", "Funkcja dostępna tylko dla użytkowników premium.")
  }

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

    // Never trust model output even after normalization.
    const validated = MindMapNodeSchema.safeParse(root)
    if (!validated.success) {
      return toFormState("ERROR", "Wygenerowana mapa była nieprawidłowa. Spróbuj ponownie.")
    }

    const content = JSON.stringify({
      title: parsed.data.topic,
      topicType,
      root: collapseBelowDepth(validated.data as MindMapNode, INITIAL_EXPANDED_DEPTH),
    })

    return {
      ...toFormState("SUCCESS", "Mapa została wygenerowana!"),
      values: { content },
    }
  } catch (error) {
    return fromErrorToFormState(error)
  }
}
