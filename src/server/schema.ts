import { z } from "zod"
import { getLexicalContent } from "@/helpers/getLexicalContent"

export const DeleteTestIdSchema = z.object({
  testId: z
    .string()
    .min(1, "Musisz podać poprawny identyfikator testu.")
    .trim(),
})

export const DeleteNoteIdSchema = z.object({
  noteId: z
    .string()
    .min(1, "Musisz podać poprawny identyfikator notatki.")
    .trim(),
})

export const CreateAnswersSchema = (allowedLengths: number[]) => {
  return z
    .array(
      z.record(z.string().min(1, "Odpowiedz na wszystkie pytania"), z.string())
    )
    .refine((data) => allowedLengths.includes(data.length), {
      message: "Odpowiedz na wszystkie pytania.",
    })
}

export const UpdateMottoSchema = z.object({
  motto: z
    .string()
    .min(1, "Motto nie może być puste")
    .max(100, "Motto nie może być dłuższe niż 100 znaków"),
})

export const SignupForSchema = z.object({
  name: z.string().min(1, "Nazwa musi mieć co najmniej 2 znaki.").trim(),
  email: z.email("Proszę podać poprawny email.").trim(),
  password: z
    .string()
    .min(8, { message: "Mieć co najmniej 8 znaków" })
    .regex(/[a-zA-Z]/, { message: "Zawierać co najmniej jedną literę." })
    .regex(/[0-9]/, { message: "Zawierać co najmniej jedną liczbę." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Zawierać co najmniej jeden znak specjalny.",
    })
    .trim(),
})

export const CreateMessageSchema = z.object({
  email: z.email({ message: "Proszę podać poprawny email" }).trim(),
  message: z
    .string()
    .min(2, { message: "Wiadomość musi mieć co najmniej 2 znaki." })
    .max(350, { message: "Wiadomość nie może być dłuższa niż 350 znaków" })
    .trim(),
})

export const UpdateUsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Nazwa użytkownika musi mieć co najmniej 3 znaki.")
    .max(50, "Nazwa użytkownika może mieć maksymalnie 50 znaków."),
})

export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(3, "Tytuł musi mieć co najmniej 3 znaki")
    .max(100, "Tytuł nie może przekraczać 100 znaków"),
  content: z.string().refine(
    (content) => {
      const textContent = getLexicalContent(content)
      return textContent.length >= 10 && textContent.length <= 2000
    },
    { message: "Treść musi mieć od 10 do 2000 znaków" }
  ),
  readonly: z.boolean().default(false),
})

export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(3, "Komentarz musi mieć minimum 3 znaki")
    .max(300, "Komentarz nie może przekraczać 300 znaków"),
  postId: z.string().min(1, "ID posta jest wymagane"),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>

export const CreateTestimonialSchema = z.object({
  content: z
    .string()
    .min(10, "Opinia musi mieć co najmniej 10 znaków")
    .max(1000, "Opinia nie może być dłuższa niż 1000 znaków"),
  rating: z
    .number()
    .min(0, "Ocena nie może być mniejsza niż 0")
    .max(5, "Ocena nie może być większa niż 5")
    .multipleOf(0.5, "Ocena musi być podawana w krokach co 0.5"),
  visible: z.coerce.boolean().default(true),
})

/**
 * Schema for validating the data required to start a new test session.
 */
export const StartTestSchema = z.object({
  category: z.string().min(1, "Musisz podać kategorię."),
  numberOfQuestions: z.coerce
    .number()
    .refine((num) => [10, 20, 40].includes(num), {
      message: "Niepoprawna ilość pytań.",
    }),
  durationMinutes: z.coerce
    .number()
    .min(1, "Niepoprawny czas trwania testu.")
    .max(120, "Niepoprawny czas trwania testu."),
  meta: z.string().default("{}"),
})

/**
 * Schema for validating the data required to create a new test.
 */
export const CreateTestSchema = z.object({
  category: z.string().min(1, { message: "Proszę wybrać kategorię" }),
  question: z
    .string()
    .min(1, { message: "Pole pytania nie może być puste" })
    .max(550, { message: "Długość nie może przekraczać 550 znaków" }),
  answers: z.array(
    z.object({
      option: z
        .string()
        .min(1, { message: "Pole odpowiedzi nie może być puste" })
        .max(350, {
          message: "Odpowiedź nie może być dłuższa niż 350 znaków",
        }),
      isCorrect: z.boolean(),
    })
  ),
})

/**
 * Schema for validating test data imported from a file.
 */
export const TestFileSchema = z.array(
  z.object({
    data: z.object({
      question: z
        .string()
        .min(1, { message: "Pole pytania nie może być puste" })
        .max(650, {
          message: "Długość nie może przekraczać 650 znaków",
        }),
      answers: z
        .array(
          z.object({
            option: z
              .string()
              .min(1, { message: "Pole odpowiedzi nie może być puste" })
              .max(500, {
                message: "Odpowiedź nie może być dłuższa niż 500 znaków",
              }),
            isCorrect: z.boolean(),
          })
        )
        .min(2, { message: "Wymagane są co najmniej 2 opcje odpowiedzi" })
        .max(5, { message: "Maksymalnie 5 opcji odpowiedzi" }),
    }),
    category: z.string().min(1, { message: "Pole kategorii jest wymagane" }),
  })
)

/**
 * Schema for validating data when creating or updating a note.
 */
export const NoteSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Tytuł notatki jest wymagany" })
    .max(256, { message: "Tytuł nie może przekraczać 256 znaków" }),
  content: z
    .string()
    .min(1, { message: "Treść notatki nie może być pusta" })
    .refine(
      (value) => {
        try {
          JSON.parse(value)
          return true
        } catch {
          return false
        }
      },
      { message: "Nieprawidłowy format danych edytora" }
    ),
  plainText: z.string().optional(),
  excerpt: z.string().optional(),
  category: z
    .string()
    .min(1, { message: "Kategoria jest wymagana" })
    .max(128, { message: "Nazwa kategorii jest zbyt długa" }),
  tags: z
    .array(
      z
        .string()
        .min(1, { message: "Tag nie może być pusty" })
        .max(50, { message: "Tag nie może przekraczać 50 znaków" })
    )
    .optional()
    .default([]),
  pinned: z.boolean().optional().default(false),
})
export const NoteUpdateSchema = NoteSchema.partial()
/**
 * Type inference for use in TypeScript.
 */
export type NoteInput = z.infer<typeof NoteSchema>
