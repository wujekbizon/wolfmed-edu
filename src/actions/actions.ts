'use server'

import { countTestScore } from '@/helpers/countTestScore'
import { parseAnswerRecord } from '@/helpers/parseAnswerRecord'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { answersSchema } from '@/server/schema'
import { FormState } from '@/types/actionTypes'
import { QuestionAnswer } from '@/types/dataTypes'
import { redirect } from 'next/navigation'

export async function submitTestAction(formState: FormState, formData: FormData) {
  try {
    // Extract answer data from the submitted form data
    const answers: QuestionAnswer[] = []
    formData.forEach((value, key) => {
      if (key.slice(0, 6) === 'answer') {
        answers.push({ [key]: value.toString() })
      }
    })

    // Validate the parsed JSON data using Zod schema
    const { success, data, error } = answersSchema.safeParse(answers)

    if (!success) {
      console.log(`Validation error: ${error.issues}`)
      return toFormState('ERROR', 'Wybierz jedna odpowiedz')
    }

    // Processing test results to get score
    const { correct } = countTestScore(data)
    // Parses an array of question-answer records and transforms it into an array of formatted
    // answers containing all question IDs and values for future database storage.
    const testResult = parseAnswerRecord(data)

    //Create a completed test object

    const completedTest = { score: correct, testResult }
  } catch (error) {
    return fromErrorToFormState(error)
  }

  // Update form state and redirect on success and redirect user to result page
  toFormState('SUCCESS', 'Test Successfully Submitted!')
  redirect('/testy-opiekun/wyniki')
}
