import { z } from 'zod'

export const createAnswersSchema = (allowedLengths: number[]) => {
  return z
    .array(z.record(z.string().min(1, 'Answer must not be empty')))
    .refine((data) => allowedLengths.includes(data.length), {
      message: 'Odpowiedz na wszystkie pytania.',
    })
}
export const signupSchema = z.object({
  name: z.string().min(1, 'Imię jest wymagane'),
  email: z.string().email('Niepoprawny adres email'),
  password: z.string().min(8, 'Hasło powinno zawierać przynajmniej 8 znaków'),
})
