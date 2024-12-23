import { z } from 'zod'

export const DeleteTestIdSchema = z.object({
  testId: z.string().min(1, 'Musisz podać poprawny identyfikator testu.').trim(),
})

export const CreateAnswersSchema = (allowedLengths: number[]) => {
  return z
    .array(z.record(z.string().min(1, 'Odpowiedz na wszystkie pytania')))
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
  title: z.string().min(10, 'Tytuł musi mieć minimum 10 znaków').max(100, 'Tytuł nie może przekraczać 100 znaków'),
  content: z.string().min(30, 'Treść musi mieć minimum 30 znaków').max(2000, 'Treść nie może przekraczać 2000 znaków'),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>
