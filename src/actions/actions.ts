'use server'

import { countTestScore } from '@/helpers/countTestScore'
import { parseAnswerRecord } from '@/helpers/parseAnswerRecord'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { QuestionAnswer } from '@/types/dataTypes'
import { redirect } from 'next/navigation'
import { db } from '@/server/db/index'
import { completedTestes, customersMessages, users } from '@/server/db/schema'
import {
  CreateAnswersSchema,
  CreateMessageSchema,
  DeleteTestIdSchema,
  UpdateMottoSchema,
  UpdateUsernameSchema,
  CreatePostSchema,
  CreateCommentSchema,
} from '@/server/schema'
import { auth } from '@clerk/nextjs/server'
import { eq, sql } from 'drizzle-orm'
import { deleteCompletedTest, getUserTestLimit, updateMottoByUserId, updateUsernameByUserId } from '@/server/queries'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createForumPost, deleteForumPost } from '@/server/queries'
import { createForumComment, deleteForumComment } from '@/server/queries'

export async function submitTestAction(formState: FormState, formData: FormData) {
  // Check user authorization before allowing submission
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  try {
    const userTestLimit = await getUserTestLimit(userId)

    if (!userTestLimit) {
      console.log('No user is found!')
      return toFormState('ERROR', 'No user is found!')
    }

    if (userTestLimit.testLimit !== null) {
      if (userTestLimit.testLimit <= 0) {
        // user exceeded his test limit
        return toFormState(
          'ERROR',
          'Wyczerpałes limit 150 testów dla darmowego konta. Wesprzyj nasz projekt, aby móc korzystać bez limitów.'
        )
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
      const formValues: Record<string, string> = {}
      formData.forEach((value, key) => {
        if (key.startsWith('answer-')) {
          formValues[key] = value.toString()
        }
      })
      return {
        ...toFormState('ERROR', validationResult.error.errors[0]?.message ?? 'Wybierz jedną odpowiedź'),
        values: formValues,
      }
    }

    // Calculate score and prepare completed test data
    const { correct } = countTestScore(validationResult.data)
    const testResult = parseAnswerRecord(validationResult.data)
    const completedTest = { userId, score: correct, testResult }

    // Execute all database operations in one transaction
    await db.transaction(async (tx) => {
      if (userTestLimit.testLimit !== null && userTestLimit.testLimit > 0) {
        // Update user test limit
        await tx
          .update(users)
          .set({
            testLimit: userTestLimit.testLimit - 1,
            testsAttempted: sql`${users.testsAttempted} + 1`,
            totalScore: sql`${users.totalScore} + ${correct}`,
            totalQuestions: sql`${users.totalQuestions} + ${testResult.length}`,
          })
          .where(eq(users.userId, userId))
      }
      await tx.insert(completedTestes).values(completedTest)
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  // Update form state and redirect on success and redirect user to result page
  toFormState('SUCCESS', 'Test został wypełniony pomyślnie')
  // revalidatePath('/testy-opiekun', 'page')
  revalidateTag('score')
  redirect('/testy-opiekun/wyniki')
}

export async function sendEmail(formState: FormState, formData: FormData) {
  const email = formData.get('email') as string
  const message = formData.get('message') as string

  const validationResult = CreateMessageSchema.safeParse({ email, message })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { email, message },
    }
  }

  try {
    await db.insert(customersMessages).values({
      email: validationResult.data.email,
      message: validationResult.data.message,
      createdAt: new Date(),
    })
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { email, message },
    }
  }

  return toFormState('SUCCESS', 'Wiadomość wysłana pomyślnie!')
}

export async function deleteTestAction(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  try {
    const testId = formData.get('testId') as string

    if (!testId) {
      return toFormState('ERROR', 'Invalid test ID')
    }

    const validationResult = DeleteTestIdSchema.safeParse({ testId })

    if (!validationResult.success) {
      return toFormState('ERROR', 'Brak testu do usunięcia')
    }

    await deleteCompletedTest(testId)
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath('testy-opiekun/wyniki')
  return toFormState('SUCCESS', 'Test usunięty pomyślnie')
}

export async function updateUsername(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const username = formData.get('username') as string

  const validationResult = UpdateUsernameSchema.safeParse({ username })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { username },
    }
  }

  try {
    await updateUsernameByUserId(userId, validationResult.data.username)
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { username },
    }
  }
  revalidatePath('/testy-opiekun')
  return toFormState('SUCCESS', 'Username updated successfully!')
}

export async function updateMotto(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const motto = formData.get('motto') as string

  const validationResult = UpdateMottoSchema.safeParse({ motto })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { motto },
    }
  }

  try {
    await updateMottoByUserId(userId, validationResult.data.motto)
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { motto },
    }
  }

  revalidatePath('/testy-opiekun')
  return toFormState('SUCCESS', 'Motto zaktualizowane pomyślnie!')
}

export async function createForumPostAction(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const readonly = formData.get('readonly') === 'true'

  const validationResult = CreatePostSchema.safeParse({ title, content, readonly })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { title, content, readonly: readonly.toString() },
    }
  }

  try {
    const post = await db.transaction(async (tx) => {
      // Get username first
      const [user] = await tx.select({ username: users.username }).from(users).where(eq(users.userId, userId))

      if (!user) throw new Error('Username not found')

      // Use createForumPost query
      return await createForumPost({
        title: validationResult.data.title,
        content: validationResult.data.content,
        authorId: userId,
        authorName: user.username || 'Anonymous',
        readonly: validationResult.data.readonly,
      })
    })

    if (!post) throw new Error('Failed to create post')
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { title, content, readonly: readonly.toString() },
    }
  }

  revalidatePath('/forum')
  return toFormState('SUCCESS', 'Post został dodany pomyślnie!')
}

export async function deletePostAction(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const postId = formData.get('postId') as string
  const authorId = formData.get('authorId') as string

  if (userId !== authorId) {
    return toFormState('ERROR', 'Nie masz uprawnień do usunięcia tego posta')
  }

  try {
    await deleteForumPost(postId)
  } catch (error) {
    return fromErrorToFormState(error)
  }

  redirect('/forum')
  return toFormState('SUCCESS', 'Post został usunięty')
}

export async function createCommentAction(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const content = formData.get('content') as string
  const postId = formData.get('postId') as string

  const validationResult = CreateCommentSchema.safeParse({ content, postId })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { content },
    }
  }

  try {
    const post = await db.transaction(async (tx) => {
      // Get username and check post in transaction
      const [user] = await tx.select({ username: users.username }).from(users).where(eq(users.userId, userId))
      const postExists = await tx.query.forumPosts.findFirst({
        where: (posts, { eq }) => eq(posts.id, postId),
        columns: { readonly: true },
      })

      if (!user) throw new Error('Username not found')
      if (!postExists) throw new Error('Post nie istnieje')
      if (postExists.readonly) throw new Error('Ten post ma wyłączone komentarze')

      // Create comment if all checks pass
      return await createForumComment({
        postId,
        content: validationResult.data.content,
        authorId: userId,
        authorName: user.username || 'Anonymous',
      })
    })

    if (!post) throw new Error('Failed to create comment')
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { content },
    }
  }

  revalidatePath('/forum')
  return toFormState('SUCCESS', 'Komentarz został dodany')
}

export async function deleteCommentAction(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const commentId = formData.get('commentId') as string
  const authorId = formData.get('authorId') as string

  if (userId !== authorId) {
    return toFormState('ERROR', 'Nie masz uprawnień do usunięcia tego komentarza')
  }

  try {
    await deleteForumComment(commentId)
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath('/forum')
  return toFormState('SUCCESS', 'Komentarz został usunięty')
}
