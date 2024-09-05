import { z } from 'zod'

export const CreateAnswersSchema = (allowedLengths: number[]) => {
  return z
    .array(z.record(z.string().min(1, 'Answer must not be empty')))
    .refine((data) => allowedLengths.includes(data.length), {
      message: 'Odpowiedz na wszystkie pytania.',
    })
}
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
