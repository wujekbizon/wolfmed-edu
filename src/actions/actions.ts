"use server"

import { countTestScore } from "@/helpers/countTestScore"
import { parseAnswerRecord } from "@/helpers/parseAnswerRecord"
import { fromErrorToFormState, toFormState } from "@/helpers/toFormState"
import { FormState } from "@/types/actionTypes"
import { QuestionAnswer } from "@/types/dataTypes"
import { redirect } from "next/navigation"
import { db } from "@/server/db/index"
import {
  completedTestes,
  customersMessages,
  forumComments,
  materials,
  tests,
  testSessions,
  users,
  userLimits,
  userCustomTests,
  userCustomCategories,
} from "@/server/db/schema"
import {
  CreateAnswersSchema,
  CreateMessageSchema,
  DeleteTestIdSchema,
  DeleteMaterialIdSchema,
  DeleteCategorySchema,
  UpdateMottoSchema,
  UpdateUsernameSchema,
  CreatePostSchema,
  CreateCommentSchema,
  CreateTestimonialSchema,
  CreateTestSchema,
  TestFileSchema,
  StartTestSchema,
  MaterialsSchema,
  CreateCustomCategorySchema,
  AddQuestionToCategorySchema,
  DeleteCustomCategorySchema,
  UpdateCategoryNameSchema,
} from "@/server/schema"
import { auth } from "@clerk/nextjs/server"
import { eq, sql, and, gt } from "drizzle-orm"
import {
  deleteCompletedTest,
  updateMottoByUserId,
  updateUsernameByUserId,
  createForumPost,
  deleteForumPost,
  createForumComment,
  deleteForumComment,
  getLastUserPostTime,
  getLastUserCommentTime,
  createTestimonial,
  expireTestSession,
  getSupporterByUserId,
  getUserStorageUsage,
  deleteUserCustomTest,
  getUserCustomCategoryById,
  deleteUserCustomCategory,
} from "@/server/queries"
import { revalidatePath } from "next/cache"
import { extractAnswerData } from "@/helpers/extractAnswerData"
import { determineTestCategory } from "@/helpers/determineTestCategory"
import { checkRateLimit } from "@/lib/rateLimit"

export async function startTestAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 20 test starts per hour
  const rateLimit = await checkRateLimit(userId, "test:start")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  try {
    const validationResult = StartTestSchema.safeParse({
      category: formData.get("category"),
      numberOfQuestions: formData.get("numberOfQuestions"),
      durationMinutes: formData.get("durationMinutes"),
      meta: formData.get("meta") ?? "{}",
    })

    if (!validationResult.success) {
      console.log(`Validation error: ${validationResult.error.issues}`)
      return toFormState(
        "ERROR",
        validationResult.error.issues[0]?.message ||
          "Nieprawidłowe dane wejściowe."
      )
    }

    const { category, numberOfQuestions, durationMinutes, meta } =
      validationResult.data

    const now = new Date()
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000)

    let parsedMeta = {}
    try {
      parsedMeta = JSON.parse(meta)
    } catch {
      console.warn("Invalid meta JSON, using empty object")
    }

    const result = await db.transaction(async (tx) => {
      // Check user permissions and limits
      const [user] = await tx
        .select({
          supporter: users.supporter,
          testLimit: users.testLimit,
        })
        .from(users)
        .where(eq(users.userId, userId))

      if (!user) {
        throw new Error("Nie znaleziono użytkownika")
      }

      // Check supporter status for 40-question tests
      if (numberOfQuestions === 40 && !user.supporter) {
        throw new Error(
          "Tylko użytkownicy konta premium mogą podejść do Egzaminu Opiekuna Medycznego."
        )
      }

      // Check test limit
      if (user.testLimit !== null && user.testLimit <= 0) {
        throw new Error(
          "Wyczerpałeś limit testów. Wesprzyj nasz projekt, aby kontynuować."
        )
      }

      // Lock and check for existing active session
      const existingSessions = await tx
        .select({ id: testSessions.id })
        .from(testSessions)
        .where(
          and(
            eq(testSessions.userId, userId),
            eq(testSessions.status, "ACTIVE")
          )
        )
        .for("update")

      if (existingSessions.length > 0) {
        throw new Error(
          "Masz już aktywną sesję testową. Zakończ ją przed rozpoczęciem nowej."
        )
      }

      // Create new session
      const [session] = await tx
        .insert(testSessions)
        .values({
          userId,
          category,
          numberOfQuestions,
          durationMinutes,
          startedAt: now,
          expiresAt,
          status: "ACTIVE",
          meta: parsedMeta,
        })
        .returning()

      return session
    })

    return {
      ...toFormState("SUCCESS", "Sesja testowa została rozpoczęta."),
      sessionId: result?.id,
      expiresAt: result?.expiresAt,
      durationMinutes: result?.durationMinutes,
      numberOfQuestions: result?.numberOfQuestions,
    }
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Processes test submission, validates answers, updates user limits and stores results
 * Handles: form validation, test limits, score calculation, and DB transaction
 */
export async function submitTestAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 20 test submits per hour
  const rateLimit = await checkRateLimit(userId, "test:submit")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const sessionId = formData.get("sessionId")
  if (!sessionId) {
    return toFormState("ERROR", "No session ID provided")
  }

  // Extract answer data from the submitted form data
  const answers: QuestionAnswer[] = []
  formData.forEach((value, key) => {
    if (key.slice(0, 6) === "answer") {
      answers.push({ [key]: value.toString() })
    }
  })

  const allowedLengths = [10, 20, 40]
  const answersSchema = CreateAnswersSchema(allowedLengths)
  const validationResult = answersSchema.safeParse(answers)

  if (!validationResult.success) {
    console.log(`Validation error: ${validationResult.error.issues}`)
    const formValues: Record<string, string> = {}
    formData.forEach((value, key) => {
      if (key.startsWith("answer-")) {
        formValues[key] = value.toString()
      }
    })
    return {
      ...toFormState(
        "ERROR",
        validationResult.error.issues[0]?.message || "Wybierz jedną odpowiedź"
      ),
      values: formValues,
    }
  }

  // Calculate score and prepare completed test data
  const { correct } = countTestScore(validationResult?.data as QuestionAnswer[])
  const testResult = parseAnswerRecord(
    validationResult?.data as QuestionAnswer[]
  )

  try {
    await db.transaction(async (tx) => {
      const now = new Date()

      // Lock and verify session FIRST
      const result = await tx.execute(
        sql`SELECT * FROM ${testSessions}
            WHERE ${testSessions.id} = ${sessionId}
            AND ${testSessions.userId} = ${userId}
            AND ${testSessions.status} = 'ACTIVE'
            FOR UPDATE`
      )
      const session = result.rows?.[0] as any

      if (!session) {
        throw new Error("Nie znaleziono aktywnej sesji testu")
      }

      // Check expiry BEFORE checking test limit
      if (now > session.expiresAt) {
        await tx
          .update(testSessions)
          .set({ status: "EXPIRED", finishedAt: now })
          .where(eq(testSessions.id, session.id))
        throw new Error("Sesja wygasła — czas się skończył")
      }

      // We check test limit (inside transaction for consistency and to avoid race conditions)
      const [userTestLimit] = await tx
        .select({
          testLimit: users.testLimit,
          userId: users.userId,
        })
        .from(users)
        .where(eq(users.userId, userId))

      if (!userTestLimit) {
        throw new Error("Nie znaleziono użytkownika")
      }

      // Check if user has tests remaining
      if (userTestLimit.testLimit !== null && userTestLimit.testLimit <= 0) {
        throw new Error(
          "Wyczerpałeś limit 25 testów dla darmowego konta. Wesprzyj nasz projekt, aby móc korzystać bez limitów."
        )
      }

      if (userTestLimit.testLimit !== null && userTestLimit.testLimit > 0) {
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

      // Insert completed test
      await tx.insert(completedTestes).values({
        userId,
        sessionId: session.id,
        score: correct,
        testResult,
      })

      // Mark session as completed
      await tx
        .update(testSessions)
        .set({ status: "COMPLETED", finishedAt: now })
        .where(eq(testSessions.id, session.id))
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  // Update form state and redirect on success and redirect user to result page
  toFormState("SUCCESS", "Test został wypełniony pomyślnie")
  revalidatePath("/panel", "page")
  redirect("/panel/wyniki")
}

/**
 * Handles customer message submission with email validation
 * Stores: email and message in customersMessages table
 */
export async function sendEmail(formState: FormState, formData: FormData) {
  const email = formData.get("email") as string
  const message = formData.get("message") as string

  // Rate limiting: 3 emails per hour (using email as identifier for unauthenticated action)
  const rateLimit = await checkRateLimit(email || "anonymous", "email:send")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

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

  return toFormState("SUCCESS", "Wiadomość wysłana pomyślnie!")
}

/**
 * Deletes a completed test if user is authorized
 * Validates: user ownership and test existence
 */
export async function deleteTestAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 10 test deletes per hour
  const rateLimit = await checkRateLimit(userId, "test:delete")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  try {
    const testId = formData.get("testId") as string

    if (!testId) {
      return toFormState("ERROR", "Invalid test ID")
    }

    const validationResult = DeleteTestIdSchema.safeParse({ testId })

    if (!validationResult.success) {
      return toFormState("ERROR", "Brak testu do usunięcia")
    }

    await deleteCompletedTest(testId)
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath("panel/wyniki")
  return toFormState("SUCCESS", "Test usunięty pomyślnie")
}

/**
 * Updates user's display name with validation
 * Handles: username format validation and DB update
 */
export async function updateUsername(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 3 username updates per hour
  const rateLimit = await checkRateLimit(userId, "profile:update:username")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const username = formData.get("username") as string

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
  revalidatePath("/panel")
  return toFormState(
    "SUCCESS",
    "Nazwa użytkownika została pomyślnie zaktualizowana!"
  )
}

/**
 * Updates user's motto with validation
 * Handles: motto format validation and DB update
 */
export async function updateMotto(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 5 motto updates per hour
  const rateLimit = await checkRateLimit(userId, "profile:update:motto")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const motto = formData.get("motto") as string

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

  revalidatePath("/panel")
  return toFormState("SUCCESS", "Motto zaktualizowane pomyślnie!")
}

/**
 * Creates a forum post with rate limiting (5 posts per hour)
 * Handles: content validation, rate limiting, and user verification
 */
export async function createForumPostAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 5 posts per hour
  const rateLimit = await checkRateLimit(userId, "forum:post:create")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const readonly = formData.get("readonly") === "true"

  const validationResult = CreatePostSchema.safeParse({
    title,
    content,
    readonly,
  })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { title, content, readonly: readonly.toString() },
    }
  }

  try {
    const post = await db.transaction(async (tx) => {
      // Get username first
      const [user] = await tx
        .select({ username: users.username })
        .from(users)
        .where(eq(users.userId, userId))

      if (!user) throw new Error("Username not found")

      // Use createForumPost query
      return await createForumPost({
        title: validationResult.data.title,
        content: validationResult.data.content,
        authorId: userId,
        authorName: user.username || "Anonymous",
        readonly: validationResult.data.readonly,
      })
    })

    if (!post) throw new Error("Failed to create post")
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { title, content, readonly: readonly.toString() },
    }
  }

  revalidatePath("/forum")
  return toFormState("SUCCESS", "Post został dodany pomyślnie!")
}

/**
 * Deletes a forum post if user is the author
 * Validates: user ownership before deletion
 */
export async function deletePostAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 10 post deletes per hour
  const rateLimit = await checkRateLimit(userId, "forum:post:delete")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const postId = formData.get("postId") as string
  const authorId = formData.get("authorId") as string

  if (userId !== authorId) {
    return toFormState("ERROR", "Nie masz uprawnień do usunięcia tego posta")
  }

  try {
    await deleteForumPost(postId)
  } catch (error) {
    return fromErrorToFormState(error)
  }

  redirect("/forum")
  return toFormState("SUCCESS", "Post został usunięty")
}

/**
 * Creates a forum comment with rate limiting (20 comments per hour)
 * Handles: content validation, rate limiting, readonly check, and user verification
 */
export async function createCommentAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 20 comments per hour
  const rateLimit = await checkRateLimit(userId, "forum:comment:create")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const content = formData.get("content") as string
  const postId = formData.get("postId") as string

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
      const [user] = await tx
        .select({ username: users.username })
        .from(users)
        .where(eq(users.userId, userId))
      const postExists = await tx.query.forumPosts.findFirst({
        where: (posts, { eq }) => eq(posts.id, postId),
        columns: { readonly: true },
      })

      if (!user) throw new Error("Username not found")
      if (!postExists) throw new Error("Post nie istnieje")
      if (postExists.readonly)
        throw new Error("Ten post ma wyłączone komentarze")

      // Create comment if all checks pass
      return await createForumComment({
        postId,
        content: validationResult.data.content,
        authorId: userId,
        authorName: user.username || "Anonymous",
      })
    })

    if (!post) throw new Error("Failed to create comment")
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { content },
    }
  }

  revalidatePath("/forum")
  return toFormState("SUCCESS", "Komentarz został dodany")
}

/**
 * Deletes a forum comment if user is the author
 * Validates: user ownership before deletion
 */
export async function deleteCommentAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 20 comment deletes per hour
  const rateLimit = await checkRateLimit(userId, "forum:comment:delete")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const commentId = formData.get("commentId") as string
  const authorId = formData.get("authorId") as string

  if (userId !== authorId) {
    return toFormState(
      "ERROR",
      "Nie masz uprawnień do usunięcia tego komentarza"
    )
  }

  try {
    await deleteForumComment(commentId)
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath("/forum")
  return toFormState("SUCCESS", "Komentarz został usunięty")
}

export async function createTestimonialAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Rate limiting: 2 testimonials per hour
  const rateLimit = await checkRateLimit(userId, "testimonial:create")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const content = formData.get("content") as string
  const rating = Number(formData.get("rating")) || 0
  const visibleRaw = formData.get("visible") as string | null

  const visible = visibleRaw === "on"

  const validationResult = CreateTestimonialSchema.safeParse({
    content,
    rating,
    visible: true,
  })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { content, rating, visible },
    }
  }

  try {
    await createTestimonial({
      userId,
      ...validationResult.data,
      visible: true,
    })
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { content, rating },
    }
  }

  revalidatePath("/panel")
  return toFormState("SUCCESS", "Opinia została dodana pomyślnie!")
}

// Function to create a single test object
export async function createTestAction(
  formState: FormState,
  formData: FormData
) {
  const user = await auth()
  if (!user.userId) throw new Error("Unauthorized")

  const isSupporter = await getSupporterByUserId(user.userId)
  if (!isSupporter) {
    return toFormState(
      "ERROR",
      "Ta funkcja jest dostępna tylko dla użytkowników premium."
    )
  }

  // Rate limiting: 5 test creations per hour
  const rateLimit = await checkRateLimit(user.userId, "test:create")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  try {
    const answersData = extractAnswerData(formData)

    const testCategory = determineTestCategory(formData)

    const { answers, category, question } = CreateTestSchema.parse({
      category: testCategory,
      question: formData.get("question"),
      answers: answersData,
    })

    const correctAnswers = answersData.filter((answer) => answer.isCorrect)
    if (correctAnswers.length !== 1) {
      return toFormState("ERROR", "Wybierz dokładnie jedną poprawną odpowiedź.")
    }

    const data = {
      question,
      answers,
    }

    await db.insert(userCustomTests).values({
      userId: user.userId,
      category: category.toLowerCase(),
      data,
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath("/panel/dodaj-test")
  revalidatePath("/panel/testy")

  return toFormState("SUCCESS", "Test został utworzony pomyślnie")
}

// Function to upload tests from a file
export async function uploadTestsFromFile(
  FormState: FormState,
  formData: FormData
) {
  const user = await auth()
  if (!user.userId) throw new Error("Unauthorized")

  const isSupporter = await getSupporterByUserId(user.userId)
  if (!isSupporter) {
    return toFormState(
      "ERROR",
      "Ta funkcja jest dostępna tylko dla użytkowników premium."
    )
  }

  // Rate limiting: 10 file uploads per hour
  const rateLimit = await checkRateLimit(user.userId, "file:upload")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const file = formData.get("file") as File
  if (!file) throw new Error("Proszę wybrać plik!")

  if (file.size > 5_000_000) {
    return toFormState("ERROR", "Plik jest zbyt duży. Maksymalny rozmiar: 5MB")
  }

  try {
    const fileReader = file.stream().getReader()
    const testsDataU8: Uint8Array[] = []

    while (true) {
      const { done, value } = await fileReader.read()
      if (done) break
      testsDataU8.push(value as Uint8Array)
    }

    const testsBinary = Buffer.concat(testsDataU8)
    const fileContent = testsBinary.toString("utf8")

    if (!fileContent)
      return toFormState("ERROR", "Proszę wybrać plik do przesłania!")

    const parsedData = JSON.parse(fileContent)

    const validationResult = await TestFileSchema.safeParseAsync(parsedData)

    if (!validationResult.success) {
      console.error("Validation Errors:", validationResult.error.issues)
      return toFormState(
        "ERROR",
        "Nieprawidłowy format danych. Sprawdź dokumentację."
      )
    }

    const validatedData = validationResult.data

    if (validatedData.length > 1000) {
      return toFormState(
        "ERROR",
        "Plik zawiera zbyt wiele pytań. Maksymalnie 1000 pytań na plik."
      )
    }

    await db.transaction(async (tx) => {
      const insertPromises = validatedData.map((testData) =>
        tx.insert(userCustomTests).values({
          userId: user.userId,
          category: testData.category.toLowerCase(),
          data: testData.data,
        })
      )
      await Promise.all(insertPromises)
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Error parsing JSON:", error.message)
      return toFormState(
        "ERROR",
        "Nieprawidłowy format JSON. Upewnij się, że dane są poprawne."
      )
    } else {
      return fromErrorToFormState(error)
    }
  }

  revalidatePath("/panel/dodaj-test")
  revalidatePath("/panel/testy")

  return toFormState("SUCCESS", "Testy zostały pomyślnie dodane")
}

export async function expireSessionAction(sessionId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  try {
    await expireTestSession(sessionId, userId)
    return { 
      status: "SUCCESS" as const, 
      message: "Sesja została zakończona" 
    }
  } catch (error) {
    console.error("Error expiring session:", error)
    return { status: "SUCCESS" as const, message: "Sesja została zakończona" }
  }
}

/**
 * Delete user-created test with ownership verification
 */
export async function deleteUserCustomTestAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const testId = formData.get("testId") as string

  if (!testId) {
    return toFormState("ERROR", "Nieprawidłowe ID testu")
  }

  try {
    const result = await deleteUserCustomTest(userId, testId)

    if (!result || result.rowCount === 0) {
      return toFormState("ERROR", "Test nie został znaleziony")
    }
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath("/panel/dodaj-test")
  revalidatePath("/panel/testy")

  return toFormState("SUCCESS", "Test został usunięty pomyślnie")
}

/**
 * Delete all user-created tests in a specific category
 */
export async function deleteUserCustomTestsByCategoryAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const category = formData.get("category") as string

  const validationResult = DeleteCategorySchema.safeParse({ category })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { category },
    }
  }

  try {
    const result = await db
      .delete(userCustomTests)
      .where(
        and(
          eq(userCustomTests.userId, userId),
          eq(userCustomTests.category, validationResult.data.category)
        )
      )

    if (!result || result.rowCount === 0) {
      return toFormState("ERROR", "Nie znaleziono testów w tej kategorii")
    }
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath("/panel/dodaj-test")
  revalidatePath("/panel/testy")
  revalidatePath("/panel/nauka")

  return toFormState(
    "SUCCESS",
    `Usunięto wszystkie testy z kategorii: ${validationResult.data.category}`
  )
}

/**
 * Create a new custom category
 */
export async function createCustomCategoryAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const categoryName = formData.get("categoryName") as string

  const validationResult = CreateCustomCategorySchema.safeParse({
    categoryName,
  })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { categoryName },
    }
  }

  try {
    await db.insert(userCustomCategories).values({
      userId,
      categoryName: validationResult.data.categoryName,
      questionIds: [],
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath("/panel/dodaj-test")
  revalidatePath("/panel/nauka")
  revalidatePath("/panel/testy")

  return toFormState("SUCCESS", "Kategoria została utworzona pomyślnie")
}

/**
 * Add question to custom category
 */
export async function addQuestionToCategoryAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const categoryId = formData.get("categoryId") as string
  const questionId = formData.get("questionId") as string

  const validationResult = AddQuestionToCategorySchema.safeParse({
    categoryId,
    questionId,
  })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { categoryId, questionId },
    }
  }

  try {
    const category = await getUserCustomCategoryById(
      userId,
      validationResult.data.categoryId
    )

    if (!category) {
      return toFormState("ERROR", "Kategoria nie została znaleziona")
    }

    const currentIds = category.questionIds as string[]
    if (!currentIds.includes(validationResult.data.questionId)) {
      const updatedIds = [...currentIds, validationResult.data.questionId]

      await db
        .update(userCustomCategories)
        .set({
          questionIds: updatedIds,
          updatedAt: new Date(),
        })
        .where(eq(userCustomCategories.id, validationResult.data.categoryId))
    }
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath("/panel/dodaj-test")
  return toFormState("SUCCESS", "Pytanie dodane do kategorii")
}

/**
 * Remove question from custom category
 */
export async function removeQuestionFromCategoryAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const categoryId = formData.get("categoryId") as string
  const questionId = formData.get("questionId") as string

  const validationResult = AddQuestionToCategorySchema.safeParse({
    categoryId,
    questionId,
  })

  if (!validationResult.success) {
    return fromErrorToFormState(validationResult.error)
  }

  try {
    const category = await getUserCustomCategoryById(
      userId,
      validationResult.data.categoryId
    )

    if (!category) {
      return toFormState("ERROR", "Kategoria nie została znaleziona")
    }

    const currentIds = category.questionIds as string[]
    const updatedIds = currentIds.filter(
      (id) => id !== validationResult.data.questionId
    )

    await db
      .update(userCustomCategories)
      .set({
        questionIds: updatedIds,
        updatedAt: new Date(),
      })
      .where(eq(userCustomCategories.id, validationResult.data.categoryId))
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath("/panel/dodaj-test")
  return toFormState("SUCCESS", "Pytanie usunięte z kategorii")
}

/**
 * Delete custom category
 */
export async function deleteCustomCategoryAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const categoryId = formData.get("categoryId") as string

  const validationResult = DeleteCustomCategorySchema.safeParse({ categoryId })

  if (!validationResult.success) {
    return fromErrorToFormState(validationResult.error)
  }

  try {
    const result = await deleteUserCustomCategory(
      userId,
      validationResult.data.categoryId
    )

    if (!result || result.rowCount === 0) {
      return toFormState("ERROR", "Kategoria nie została znaleziona")
    }
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath("/panel/dodaj-test")
  revalidatePath("/panel/nauka")
  revalidatePath("/panel/testy")

  return toFormState("SUCCESS", "Kategoria została usunięta pomyślnie")
}

/**
 * Update category name
 */
export async function updateCategoryNameAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const categoryId = formData.get("categoryId") as string
  const categoryName = formData.get("categoryName") as string

  const validationResult = UpdateCategoryNameSchema.safeParse({
    categoryId,
    categoryName,
  })

  if (!validationResult.success) {
    return fromErrorToFormState(validationResult.error)
  }

  try {
    const category = await getUserCustomCategoryById(
      userId,
      validationResult.data.categoryId
    )

    if (!category) {
      return toFormState("ERROR", "Kategoria nie została znaleziona")
    }

    await db
      .update(userCustomCategories)
      .set({
        categoryName: validationResult.data.categoryName,
        updatedAt: new Date(),
      })
      .where(eq(userCustomCategories.id, validationResult.data.categoryId))
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath("/panel/dodaj-test")
  return toFormState("SUCCESS", "Nazwa kategorii została zaktualizowana")
}
