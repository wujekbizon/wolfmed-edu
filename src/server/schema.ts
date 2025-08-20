import { z } from 'zod'
import { getLexicalContent } from '@/helpers/getLexicalContent'

export const DeleteTestIdSchema = z.object({
  testId: z.string().min(1, 'Musisz podać poprawny identyfikator testu.').trim(),
})

export const CreateAnswersSchema = (allowedLengths: number[]) => {
  return z
    .array(z.record(z.string(), z.string().min(1, 'Odpowiedz na wszystkie pytania')))
    .refine((data) => allowedLengths.includes(data.length), {
      message: 'Odpowiedz na wszystkie pytania.',
    })
}

export const UpdateMottoSchema = z.object({
  motto: z.string().min(1, 'Motto nie może być puste').max(100, 'Motto nie może być dłuższe niż 100 znaków'),
})

export const SignupForSchema = z.object({
  name: z.string().min(1, 'Nazwa musi mieć co najmniej 2 znaki.').trim(),
  email: z.string().email('Proszę podać poprawny email.').trim(),
  password: z
    .string()
    .min(8, { message: 'Mieć co najmniej 8 znaków' })
    .regex(/[a-zA-Z]/, { message: 'Zawierać co najmniej jedną literę.' })
    .regex(/[0-9]/, { message: 'Zawierać co najmniej jedną liczbę.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Zawierać co najmniej jeden znak specjalny.',
    })
    .trim(),
})

export const CreateMessageSchema = z.object({
  email: z.string().email({ message: 'Proszę podać poprawny email' }).trim(),
  message: z
    .string()
    .min(2, { message: 'Wiadomość musi mieć co najmniej 2 znaki.' })
    .max(350, { message: 'Wiadomość nie może być dłuższa niż 350 znaków' })
    .trim(),
})

export const UpdateUsernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Nazwa użytkownika musi mieć co najmniej 3 znaki.')
    .max(50, 'Nazwa użytkownika może mieć maksymalnie 50 znaków.'),
})

export const CreatePostSchema = z.object({
  title: z.string().min(3, 'Tytuł musi mieć co najmniej 3 znaki').max(100, 'Tytuł nie może przekraczać 100 znaków'),
  content: z.string().refine(
    (content) => {
      const textContent = getLexicalContent(content)
      return textContent.length >= 10 && textContent.length <= 2000
    },
    { message: 'Treść musi mieć od 10 do 2000 znaków' }
  ),
  readonly: z.boolean().default(false),
})

export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(3, 'Komentarz musi mieć minimum 3 znaki')
    .max(300, 'Komentarz nie może przekraczać 300 znaków'),
  postId: z.string().min(1, 'ID posta jest wymagane'),
})

export const CreateLectureSchema = z.object({
  name: z
    .string()
    .min(3, 'Lecture name must be at least 3 characters')
    .max(100, 'Lecture name cannot exceed 100 characters'),
  date: z.string().min(1, 'Date is required'),
  roomId: z.string().min(1, 'Room ID is required'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  maxParticipants: z
    .number()
    .min(1, 'Must have at least 1 participant')
    .max(100, 'Cannot exceed 100 participants')
    .optional(),
})

export const UpdateLectureSchema = CreateLectureSchema.partial()

export const LoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username cannot exceed 50 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>
export type CreateLectureInput = z.infer<typeof CreateLectureSchema>
export type UpdateLectureInput = z.infer<typeof UpdateLectureSchema>
export type LoginInput = z.infer<typeof LoginSchema>
