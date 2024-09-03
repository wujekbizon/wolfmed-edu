'use server'

import { countTestScore } from '@/helpers/countTestScore'
import { parseAnswerRecord } from '@/helpers/parseAnswerRecord'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState, FormStateSignup } from '@/types/actionTypes'
import { QuestionAnswer } from '@/types/dataTypes'
import { redirect } from 'next/navigation'
import { db } from '@/server/db/index'
import { completedTestes } from '@/server/db/schema'
import { USER_ID } from '@/constants/tempUser'
import { CreateAnswersSchema, SignupForSchema } from '@/server/schema'

export async function submitTestAction(formState: FormState, formData: FormData) {
  try {
    // Extract answer data from the submitted form data
    const answers: QuestionAnswer[] = []
    formData.forEach((value, key) => {
      if (key.slice(0, 6) === 'answer') {
        answers.push({ [key]: value.toString() })
      }
    })

    const allowedLengths = [10, 20, 40]
    const answersSchema = CreateAnswersSchema(allowedLengths)

    // Validate the parsed JSON data using Zod schema
    const validationResult = answersSchema.safeParse(answers)

    if (!validationResult.success) {
      console.log(`Validation error: ${validationResult.error.issues}`)
      return toFormState('ERROR', validationResult.error.errors[0]?.message ?? 'Wybierz jedną odpowiedź')
    }

    // Generate temp user id with uuid
    const userId = USER_ID

    // Processing test results to get score
    const { correct } = countTestScore(validationResult.data)
    // Parses an array of question-answer records and transforms it into an array of formatted
    // answers containing all question IDs and values for future database storage.
    const testResult = parseAnswerRecord(validationResult.data)

    // Create a completed test object
    const completedTest = { userId, score: correct, testResult }

    // Insert completed tests to db
    await db.insert(completedTestes).values(completedTest)
  } catch (error) {
    return fromErrorToFormState(error)
  }

  // Update form state and redirect on success and redirect user to result page
  toFormState('SUCCESS', 'Test został wypełniony pomyślnie')
  redirect('/testy-opiekun/wyniki')
}

export async function signup(formState: FormStateSignup, formData: FormData) {
  const validationResult = SignupForSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    }
  }

  console.log(validationResult.data)

  return undefined
  // return toFormState('SUCCESS', 'Konto zarejestrowane pomyślnie!')
}
