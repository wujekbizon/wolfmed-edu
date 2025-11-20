'use server'

import { notes } from "@/server/db/schema"
import { db } from "@/server/db/index"
import { DeleteNoteIdSchema, NoteInput, NoteSchema, NoteUpdateSchema } from "@/server/schema"
import { fromErrorToFormState, toFormState } from "@/helpers/toFormState"
import { FormState } from "@/types/actionTypes"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { deleteNote, updateNote } from "@/server/queries"
import { parseLexicalContent } from "@/lib/safeJsonParse"
import { checkRateLimit } from "@/lib/rateLimit"

export const createNoteAction = async (
  formState: FormState,
  formData: FormData
) => {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 10 notes per hour
  const rateLimit = await checkRateLimit(userId, 'note:create')
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const data: Partial<NoteInput> = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    plainText: (formData.get("plainText") as string) || "",
    excerpt: (formData.get("excerpt") as string) || "",
    category: formData.get("category") as string,
    tags:  [formData.get("tag1"), formData.get("tag2"), formData.get("tag3")]
    .filter(Boolean)
    .map((t) => (t as string).trim()),
    pinned: formData.get("pinned") === "true",
  }

  const validationResult = NoteSchema.safeParse(data)
  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: data,
    }
  }

  const contentResult = parseLexicalContent(validationResult.data.content)

  if (!contentResult.success) {
    return toFormState("ERROR", `Błąd zapisu treści: ${contentResult.error}`)
  }

  try {
    await db
      .insert(notes)
      .values({
        ...validationResult.data,
        content: contentResult.content,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
  } catch (error) {
    console.error('Database error creating note:', error)
    return {
      ...fromErrorToFormState(error),
      values: data,
    }
  }
  revalidatePath("panel/nauka")
  return toFormState("SUCCESS", "Notatka została utworzona pomyślnie!")
}

export async function deleteNoteAction(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 20 deletes per hour
  const rateLimit = await checkRateLimit(userId, 'note:delete')
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  try {
    const noteId = formData.get("noteId") as string

    if (!noteId) {
      return toFormState("ERROR", "Niepoprawne ID notatki")
    }

    const validationResult = DeleteNoteIdSchema.safeParse({ noteId })

    if (!validationResult.success) {
      return toFormState("ERROR", "Brak notatki do usunięcia")
    }

    await deleteNote(userId,noteId)
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath("panel/nauka")
  return toFormState("SUCCESS", "Notatka usunięty pomyślnie")
}

export const updateNoteContentAction = async (
  formState: FormState,
  formData: FormData
) => {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 30 updates per hour
  const rateLimit = await checkRateLimit(userId, 'note:update')
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const noteId = formData.get("noteId") as string
  const data = {
    content: formData.get("content") as string,
    plainText: (formData.get("plainText") as string) || "",
    excerpt: (formData.get("excerpt") as string) || "",
  }

  const ContentOnlySchema = NoteUpdateSchema.pick({
    content: true,
    plainText: true,
    excerpt: true
  }).required()

  const validationResult = ContentOnlySchema.safeParse(data)
  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: data,
    }
  }

  try {
    await updateNote(userId, noteId, validationResult.data)
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: data,
    }
  }

  revalidatePath("/panel/nauka")
  revalidatePath(`/panel/nauka/notatki/${noteId}`)
  return toFormState("SUCCESS", "Zaktualizowano treść notatki")
}