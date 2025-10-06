'use server'

import { notes } from "@/server/db/schema"
import { db } from "@/server/db/index"
import { NoteInput, NoteSchema } from "@/server/schema"
import { fromErrorToFormState, toFormState } from "@/helpers/toFormState"
import { FormState } from "@/types/actionTypes"
import { auth } from "@clerk/nextjs/server"

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

  console.log(data)
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

  return toFormState("SUCCESS", "Notatka została utworzona pomyślnie!")
}
