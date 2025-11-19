'use server'

import { notes } from "@/server/db/schema"
import { db } from "@/server/db/index"
import { DeleteNoteIdSchema, NoteInput, NoteSchema, NoteUpdateSchema } from "@/server/schema"
import { fromErrorToFormState, toFormState } from "@/helpers/toFormState"
import { FormState } from "@/types/actionTypes"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { deleteNote, updateNote } from "@/server/queries"

export const createNoteAction = async (
  formState: FormState,
  formData: FormData
) => {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

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

  try {
    await db
      .insert(notes)
      .values({
        ...validationResult.data,
        content: JSON.parse(validationResult.data.content),
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
  } catch (error) {
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