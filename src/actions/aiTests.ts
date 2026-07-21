"use server"

import { auth } from "@clerk/nextjs/server"
import { checkPremiumAccessAction } from "@/actions/course-actions"
import { checkRateLimit } from "@/lib/rateLimit"
import { toFormState, fromErrorToFormState } from "@/helpers/toFormState"
import { GenerateAITestsSchema, TestFileSchema } from "@/server/schema"
import { retrieveContexts } from "@/server/vertex-rag/retrieve"
import { executeToolLocally } from "@/server/tools/executor"
import { getAccessibleCategories } from "@/helpers/populateCategories"
import type { FormState } from "@/types/actionTypes"

const CUSTOM_COURSE = "kategoria-wlasna"

/**
 * Generates test questions from a free-text topic/medical problem, grounded in
 * the course corpus (same Vertex AI + RAG path as the mind-map feature). The
 * questions are returned in FormState.values for preview only — the user saves
 * them through saveAIGeneratedTestsAction, which persists + links the category.
 */
export async function generateAITestsAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const isPremium = await checkPremiumAccessAction()
  if (!isPremium) {
    return toFormState("ERROR", "Funkcja dostępna tylko dla użytkowników premium.")
  }

  const parsed = GenerateAITestsSchema.safeParse({
    topic: formData.get("topic"),
    linkedCategory: formData.get("linkedCategory"),
    categoryName: formData.get("categoryName"),
    questionCount: formData.get("questionCount"),
  })
  if (!parsed.success) {
    return {
      ...toFormState("ERROR", "Popraw błędy w formularzu."),
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        topic: (formData.get("topic") as string) ?? "",
        categoryName: (formData.get("categoryName") as string) ?? "",
      },
    }
  }

  const accessibleValues = new Set(
    (await getAccessibleCategories()).map((c) => c.value.toLowerCase())
  )
  if (!accessibleValues.has(parsed.data.linkedCategory.toLowerCase())) {
    return {
      ...toFormState("ERROR", "Wybierz przedmiot z listy dostępnych kategorii."),
      fieldErrors: { linkedCategory: ["Nieprawidłowy przedmiot."] },
    }
  }

  const rateLimit = await checkRateLimit(userId, "quiz:generate")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Limit generowania na dziś wyczerpany. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const categoryName = parsed.data.categoryName.toLowerCase()

  try {
    // Ground the generation in the corpus; fall back to the raw topic when the
    // knowledge base has nothing relevant so the feature still works.
    let content = parsed.data.topic
    try {
      const contexts = await retrieveContexts(parsed.data.topic, { topK: 12 })
      if (contexts.length > 0) {
        content = contexts.map((c, i) => `[${i + 1}] ${c.text}`).join("\n\n")
      }
    } catch (error) {
      console.error("[aiTests] retrieveContexts failed, using raw topic:", error)
    }

    const result = await executeToolLocally("utworz_test", {
      questionCount: parsed.data.questionCount,
      category: categoryName,
      content,
    })

    const generated = JSON.parse(result.content) as {
      questions?: Array<{ data: unknown }>
    }

    // Reshape to the custom-course TestFileSchema shape and never trust the model.
    const reshaped = (generated.questions ?? []).map((q) => ({
      data: q.data,
      meta: { course: CUSTOM_COURSE, category: categoryName },
    }))

    const validation = TestFileSchema.safeParse(reshaped)
    if (!validation.success || validation.data.length === 0) {
      return toFormState(
        "ERROR",
        "Wygenerowane pytania były nieprawidłowe. Spróbuj ponownie."
      )
    }

    return {
      ...toFormState("SUCCESS", `Wygenerowano ${validation.data.length} pytań!`),
      values: {
        questionsJson: JSON.stringify(validation.data),
        categoryName: parsed.data.categoryName,
        linkedCategory: parsed.data.linkedCategory.toLowerCase(),
      },
    }
  } catch (error) {
    return fromErrorToFormState(error)
  }
}
