"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/server/db/index"
import { userLimits, materials, users } from "@/server/db/schema"
import { DeleteMaterialIdSchema, MaterialsSchema } from "@/server/schema"
import { fromErrorToFormState, toFormState } from "@/helpers/toFormState"
import { FormState } from "@/types/actionTypes"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { UTApi } from "uploadthing/server"
import { checkRateLimit } from "@/lib/rateLimit"

const utapi = new UTApi()

export async function deleteMaterialAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  try {
    const materialId = formData.get("materialId") as string

    if (!materialId) {
      return toFormState("ERROR", "Niepoprawne ID materiału")
    }

    const validationResult = DeleteMaterialIdSchema.safeParse({ materialId })

    if (!validationResult.success) {
      return toFormState("ERROR", "Brak materiału do usunięcia")
    }

    const materialToDelete = await db
      .select()
      .from(materials)
      .where(and(eq(materials.id, materialId), eq(materials.userId, userId)))
      .limit(1)
      .then((rows) => rows[0])

    if (!materialToDelete) {
      return toFormState("ERROR", "Materiał nie został znaleziony")
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(materials)
        .where(and(eq(materials.id, materialId), eq(materials.userId, userId)))

      await tx
        .update(userLimits)
        .set({
          storageUsed: sql`GREATEST(0, ${userLimits.storageUsed} - ${materialToDelete.size})`,
          updatedAt: new Date(),
        })
        .where(eq(userLimits.userId, userId))
    })

    try {
      await utapi.deleteFiles([materialToDelete.key])
    } catch (utError) {
      console.error("UploadThing deletion failed (non-critical):", utError)
    }

    revalidatePath("/panel/nauka")
    return toFormState("SUCCESS", "Materiał został usunięty pomyślnie")
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

export async function uploadMaterialAction(
  FormState: FormState,
  formData: FormData
) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    // Rate limiting: 5 material uploads per hour
    const rateLimit = await checkRateLimit(userId, "material:upload")
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      return toFormState(
        "ERROR",
        `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
      )
    }

    const title = String(formData.get("title") ?? "")
    const key = String(formData.get("key") ?? "")
    const fileUrl = String(formData.get("fileUrl") ?? "")
    const type = String(formData.get("type") ?? "")
    const category = String(formData.get("category") ?? "")
    const size = Number(formData.get("size") ?? "")

    const validationResult = MaterialsSchema.safeParse({
      title,
      key,
      url: fileUrl,
      type,
      category,
      size,
    })

    if (!validationResult.success) {
      return {
        ...fromErrorToFormState(validationResult.error),
        values: { size, title, key, fileUrl, type, category },
      }
    }

    await db.transaction(async (tx) => {
      // Ensure userLimits exists
      const existingLimit = await tx
        .select()
        .from(userLimits)
        .where(eq(userLimits.userId, userId))
        .limit(1)

      let currentUsage = 0
      let currentLimit = 20_000_000

      if (existingLimit.length === 0) {
        // Create record only for supporters
        const user = await tx
          .select({ supporter: users.supporter })
          .from(users)
          .where(eq(users.userId, userId))
          .limit(1)

        if (user[0]?.supporter) {
          await tx.insert(userLimits).values({
            userId,
            storageLimit: 20_000_000,
            storageUsed: 0,
          })
          currentUsage = 0
          currentLimit = 20_000_000
        } else {
          throw new Error("Tylko wspierający mogą dodawać materiały")
        }
      } else {
        currentUsage = existingLimit[0]?.storageUsed ?? 0
        currentLimit = existingLimit[0]?.storageLimit ?? 20_000_000
      }

      // Validate storage limit within transaction
      if (currentUsage + validationResult.data.size > currentLimit) {
        throw new Error(
          "Przekroczono limit 20MB. Usuń niektóre pliki aby zwolnić miejsce."
        )
      }

      // Insert material
      await tx.insert(materials).values({
        userId,
        title: validationResult.data.title,
        key: validationResult.data.key,
        url: validationResult.data.url,
        type: validationResult.data.type,
        category: validationResult.data.category,
        size: validationResult.data.size,
      })

      // Update storage atomically
      await tx
        .update(userLimits)
        .set({
          storageUsed: sql`${userLimits.storageUsed} + ${validationResult.data.size}`,
          updatedAt: new Date(),
        })
        .where(eq(userLimits.userId, userId))
    })

    revalidatePath("/panel/nauka")
  } catch (error: any) {
    return toFormState("ERROR", error.message)
  }
  return toFormState("SUCCESS", "Plik został pomyślnie wrzucony")
}
