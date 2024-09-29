'use server'

import { countTestScore } from '@/helpers/countTestScore'
import { parseAnswerRecord } from '@/helpers/parseAnswerRecord'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { QuestionAnswer } from '@/types/dataTypes'
import { redirect } from 'next/navigation'
import { db } from '@/server/db/index'
import { completedTestes, customersMessages, users } from '@/server/db/schema'
import { CreateAnswersSchema, CreateMessageSchema } from '@/server/schema'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { getUserTestLimit } from '@/server/queries'

export async function submitTestAction(formState: FormState, formData: FormData) {
  // Check user authorization before allowing submission
  const { userId } = auth()
  if (!userId) throw new Error('Unauthorized')

  try {
    const userTestLimit = await getUserTestLimit(userId)

    if (!userTestLimit) {
      console.log('No user is found!')
      return toFormState('ERROR', 'No user is found!')
    }

    if (userTestLimit.testLimit !== null) {
      if (userTestLimit.testLimit <= 0) {
        // user has no premium member access or used his limit
        toFormState('ERROR', 'Wyczerpałes limit testów dla darmowego konta. Sprawdż nasze oferty dla klientów premium')
      }
    }

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

    // Processing test results to get score
    const { correct } = countTestScore(validationResult.data)
    // Parses an array of question-answer records and transforms it into an array of formatted
    // answers containing all question IDs and values for future database storage.
    const testResult = parseAnswerRecord(validationResult.data)

    // Create a completed test object
    const completedTest = { userId, score: correct, testResult }

    // Insert completed tests to db
    await db.transaction(async (tx) => {
      if (userTestLimit.testLimit !== null && userTestLimit.testLimit > 0) {
        // here I want to update user limit by decresing 1 from it
        await tx
          .update(users)
          .set({ testLimit: userTestLimit.testLimit - 1 })
          .where(eq(users.userId, userId))
      }

      await tx.insert(completedTestes).values(completedTest)
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  // Update form state and redirect on success and redirect user to result page
  toFormState('SUCCESS', 'Test został wypełniony pomyślnie')
  redirect('/testy-opiekun/wyniki')
}

export async function sendEmail(formState: FormState, formData: FormData) {
  const email = formData.get('email') as string
  const message = formData.get('message') as string

  const validationResult = CreateMessageSchema.safeParse({ email, message })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { email, message }, // Include the form values
    }
  }

  try {
    // Fetch the timestamp of the last message sent by this email
    const lastMessage = await db
      .select({ createdAt: customersMessages.createdAt })
      .from(customersMessages)
      .where(eq(customersMessages.email, email))
      .limit(1)
      .execute()

    if (lastMessage.length > 0 && lastMessage[0]?.createdAt) {
      const lastSentTime = new Date(lastMessage[0].createdAt)
      const now = new Date()
      const diffMinutes = (now.getTime() - lastSentTime.getTime()) / (1000 * 60)

      // Check if the last message was sent within the last 15 minutes
      if (diffMinutes < 15) {
        return toFormState('ERROR', 'Możesz wysłać wiadomość tylko raz na 15 minut.')
      }
    }

    await db.insert(customersMessages).values({
      email: validationResult.data.email,
      message: validationResult.data.email,
      createdAt: new Date(),
    })
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { email, message }, // Include the form values
    }
  }

  return toFormState('SUCCESS', 'Wiadomość wysłana pomyślnie!')
}
