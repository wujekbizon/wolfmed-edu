import { z } from 'zod'

/**
 * Schema for validating a user's answers to a test.
 * Requires at least one answer and validates the format of each answer.
 */
export const answersSchema = z
  .array(z.record(z.string().min(1, { message: 'Musisz wybrać dokładnie jedną odpowiedź' })))
  .nonempty({ message: 'Odpowiedz na wszystkie pytania' })
  .length(10 || 20 || 40, { message: 'Odpowiedz na wszystkie pytania' })
