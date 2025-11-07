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
} from "@/server/db/schema"
import {
  CreateAnswersSchema,
  CreateMessageSchema,
  DeleteTestIdSchema,
  DeleteMaterialIdSchema,
  UpdateMottoSchema,
  UpdateUsernameSchema,
  CreatePostSchema,
  CreateCommentSchema,
  CreateTestimonialSchema,
  CreateTestSchema,
  TestFileSchema,
  StartTestSchema,
  MaterialsSchema,
} from "@/server/schema"
import { auth } from "@clerk/nextjs/server"
import { eq, sql, and, gt } from "drizzle-orm"
import {
  deleteCompletedTest,
  getUserTestLimit,
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
  sessionExists,
  getSupporterByUserId,
  deleteMaterial,
  getUserStorageUsage,
  deleteUserCustomTest,
} from "@/server/queries"
import { revalidatePath, revalidateTag } from "next/cache"
import { extractAnswerData } from "@/helpers/extractAnswerData"
import { determineTestCategory } from "@/helpers/determineTestCategory"

export async function startTestAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

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
        validationResult.error.issues[0]?.message || "Nieprawidłowe dane wejściowe."
      )
    }

    const { category, numberOfQuestions, durationMinutes, meta } = validationResult.data

    const now = new Date()
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000)

    // Check if the user is a supporter if numberOfQuestions is 40
    if (numberOfQuestions === 40) {
      const isSupporter = await getSupporterByUserId(userId)
      if (!isSupporter) {
        return toFormState(
          "ERROR",
          "Tylko użytkownicy konta premium mogą podejść do Egzaminu Opiekuna Medycznego."
        )
      }
    }

    const [session] = await db
      .insert(testSessions)
      .values({
        userId,
        category,
        numberOfQuestions,
        durationMinutes,
        startedAt: now,
        expiresAt,
        status: "ACTIVE",
        meta: JSON.parse(meta),
      })
      .returning()

    return {
      ...toFormState("SUCCESS", "Sesja testowa została rozpoczęta."),
      sessionId: session?.id,
      expiresAt: session?.expiresAt,
      durationMinutes: session?.durationMinutes,
      numberOfQuestions: session?.numberOfQuestions,
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

  const sessionId = formData.get("sessionId")
  if (!sessionId) {
    return toFormState("ERROR", "No session ID provided")
  }

  try {
    const userTestLimit = await getUserTestLimit(userId)

    if (!userTestLimit) {
      console.log("No user is found!")
      return toFormState("ERROR", "No user is found!")
    }

    if (userTestLimit.testLimit !== null) {
      if (userTestLimit.testLimit <= 0) {
        // user exceeded his test limit
        return toFormState(
          "ERROR",
          "Wyczerpałes limit 150 testów dla darmowego konta. Wesprzyj nasz projekt, aby móc korzystać bez limitów."
        )
      }
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

    // Validate the parsed JSON data using Zod schema
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
    const { correct } = countTestScore(
      validationResult?.data as QuestionAnswer[]
    )
    const testResult = parseAnswerRecord(
      validationResult?.data as QuestionAnswer[]
    )

    // // Execute all database operations in one transaction
    // await db.transaction(async (tx) => {
    //   if (userTestLimit.testLimit !== null && userTestLimit.testLimit > 0) {
    //     // Update user test limit
    //     await tx
    //       .update(users)
    //       .set({
    //         testLimit: userTestLimit.testLimit - 1,
    //         testsAttempted: sql`${users.testsAttempted} + 1`,
    //         totalScore: sql`${users.totalScore} + ${correct}`,
    //         totalQuestions: sql`${users.totalQuestions} + ${testResult.length}`,
    //       })
    //       .where(eq(users.userId, userId))
    //   }
    //   await tx.insert(completedTestes).values(completedTest)
    // })

    // 5. Run everything in transaction
    await db.transaction(async (tx) => {
      // (a) Lock the session by ID instead of searching
      const result = await tx.execute(
        sql`SELECT * FROM ${testSessions}
            WHERE ${testSessions.id} = ${sessionId}
            AND ${testSessions.userId} = ${userId}
            AND ${testSessions.status} = 'ACTIVE'
            FOR UPDATE`
      )
      const session = result.rows?.[0] as any

      if (!session) {
        throw new Error("No active session found")
      }

      const now = new Date()

      // (b) Check expiry
      if (now > session.expiresAt) {
        await tx
          .update(testSessions)
          .set({ status: "EXPIRED", finishedAt: now })
          .where(eq(testSessions.id, session.id))
        throw new Error("Session expired — your time is up")
      }

      // (c) Update user stats if they have limits
      const userTestLimit = await getUserTestLimit(userId)
      if (!userTestLimit) {
        throw new Error("No user is found!")
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

      // (d) Insert into completed_tests
      await tx.insert(completedTestes).values({
        userId,
        sessionId: session.id,
        score: correct,
        testResult,
      })

      // (e) Mark session as completed
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
  // revalidatePath('/panel', 'page')
  revalidateTag("score", "max")
  redirect("/panel/wyniki")
}

/**
 * Handles customer message submission with email validation
 * Stores: email and message in customersMessages table
 */
export async function sendEmail(formState: FormState, formData: FormData) {
  const email = formData.get("email") as string
  const message = formData.get("message") as string

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
  return toFormState("SUCCESS", "Username updated successfully!")
}

/**
 * Updates user's motto with validation
 * Handles: motto format validation and DB update
 */
export async function updateMotto(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

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
 * Creates a forum post with rate limiting (1 post per hour)
 * Handles: content validation, rate limiting, and user verification
 */
export async function createForumPostAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

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
    // Check when user's last post was created
    const lastPostTime = await getLastUserPostTime(userId)

    if (lastPostTime) {
      const timeSinceLastPost = Date.now() - lastPostTime.getTime()
      const ONE_HOUR = 60 * 60 * 1000 // 1 hour in milliseconds

      if (timeSinceLastPost < ONE_HOUR) {
        const minutesRemaining = Math.ceil(
          (ONE_HOUR - timeSinceLastPost) / (60 * 1000)
        )
        return toFormState(
          "ERROR",
          `Możesz utworzyć następny post za ${minutesRemaining} minut.`
        )
      }
    }

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
 * Creates a forum comment with rate limiting (5 comments per hour)
 * Handles: content validation, rate limiting, readonly check, and user verification
 */
export async function createCommentAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

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
    // Check when user's last comment was created
    const lastCommentTime = await getLastUserCommentTime(userId)

    if (lastCommentTime) {
      const timeSinceLastComment = Date.now() - lastCommentTime.getTime()
      const ONE_HOUR = 60 * 60 * 1000 // 1 hour in milliseconds
      const MAX_COMMENTS_PER_HOUR = 5

      // Get count of comments in the last hour
      const commentCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumComments)
        .where(
          and(
            eq(forumComments.authorId, userId),
            gt(forumComments.createdAt, new Date(Date.now() - ONE_HOUR))
          )
        )

      if ((commentCount[0]?.count ?? 0) >= MAX_COMMENTS_PER_HOUR) {
        const minutesRemaining = Math.ceil(
          (ONE_HOUR - timeSinceLastComment) / (60 * 1000)
        )
        return toFormState(
          "ERROR",
          `Przekroczono limit 5 komentarzy na godzinę. Spróbuj ponownie za ${minutesRemaining} minut.`
        )
      }
    }

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
  // 1. Authentication
  const user = await auth()
  if (!user.userId) throw new Error("Unauthorized")

  // 2. Supporter check
  const isSupporter = await getSupporterByUserId(user.userId)
  if (!isSupporter) {
    return toFormState(
      "ERROR",
      "Ta funkcja jest dostępna tylko dla użytkowników premium."
    )
  }

  try {
    // 3. Extract answers from formData
    const answersData = extractAnswerData(formData)

    // 4. Determine the chosen category
    const testCategory = determineTestCategory(formData)

    // 5. Validate and destructure form data using Zod schema
    const { answers, category, question } = CreateTestSchema.parse({
      category: testCategory,
      question: formData.get("question"),
      answers: answersData,
    })

    // 6. Additional validation for exactly one correct answer
    const correctAnswers = answersData.filter((answer) => answer.isCorrect)
    if (correctAnswers.length !== 1) {
      return toFormState("ERROR", "Wybierz dokładnie jedną poprawną odpowiedź.")
    }

    // 7. Prepare data for database insertion
    const data = {
      question,
      answers,
    }

    // 8. Insert into userCustomTests table
    await db.insert(userCustomTests).values({
      userId: user.userId,
      category: category.toLowerCase(),
      data,
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  // 9. Revalidate paths
  revalidatePath("/panel/dodaj-test")
  revalidatePath("/panel/testy")

  return toFormState("SUCCESS", "Test został utworzony pomyślnie")
}

// Function to upload tests from a file
export async function uploadTestsFromFile(
  FormState: FormState,
  formData: FormData
) {
  // 1. Authentication
  const user = await auth()
  if (!user.userId) throw new Error("Unauthorized")

  // 2. Supporter check
  const isSupporter = await getSupporterByUserId(user.userId)
  if (!isSupporter) {
    return toFormState(
      "ERROR",
      "Ta funkcja jest dostępna tylko dla użytkowników premium."
    )
  }

  // 3. Get the uploaded file
  const file = formData.get("file") as File
  if (!file) throw new Error("Proszę wybrać plik!")

  // 4. File size check (5MB limit)
  if (file.size > 5_000_000) {
    return toFormState("ERROR", "Plik jest zbyt duży. Maksymalny rozmiar: 5MB")
  }

  try {
    // 5. Read the file content chunk by chunk
    const fileReader = file.stream().getReader()
    const testsDataU8: Uint8Array[] = []

    while (true) {
      const { done, value } = await fileReader.read()
      if (done) break
      testsDataU8.push(value as Uint8Array)
    }

    // 6. Reconstruct the file content from chunks
    const testsBinary = Buffer.concat(testsDataU8)
    const fileContent = testsBinary.toString("utf8")

    if (!fileContent)
      return toFormState("ERROR", "Proszę wybrać plik do przesłania!")

    // 7. Parse the JSON content from the file
    const parsedData = JSON.parse(fileContent)

    // 8. Validate the parsed JSON data using Zod schema
    const validationResult = await TestFileSchema.safeParseAsync(parsedData)

    if (!validationResult.success) {
      console.error("Validation Errors:", validationResult.error.issues)
      return toFormState(
        "ERROR",
        "Nieprawidłowy format danych. Sprawdź dokumentację."
      )
    }

    // 9. Data is valid, proceed with processing
    const validatedData = validationResult.data

    // 10. Question count limit (prevent abuse, TODO: implement proper rate limiting)
    if (validatedData.length > 1000) {
      return toFormState(
        "ERROR",
        "Plik zawiera zbyt wiele pytań. Maksymalnie 1000 pytań na plik."
      )
    }

    // 11. Batch insert with transaction into userCustomTests
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

  // 12. Revalidate paths
  revalidatePath("/panel/dodaj-test")
  revalidatePath("/panel/testy")

  return toFormState("SUCCESS", "Testy zostały pomyślnie dodane")
}

export async function expireSessionAction(sessionId: string) {
  try {
    const exists = await sessionExists(sessionId)
    if (!exists) {
      return { status: "ERROR", message: "Nie znaleziono sesji o podanym ID." }
    }
    await expireTestSession(sessionId)

    return { status: "SUCCESS" }
  } catch (error) {
    return { status: "ERROR", message: "Nie udało się zakończyć sesji." }
  }
}

export async function uploadMaterialAction(  FormState: FormState, formData: FormData) {
  try {
    const {userId} = await auth();
    if (!userId) throw new Error("Unauthorized");

    const title = String(formData.get("title") ?? "");
    const key = String(formData.get("key") ?? "");
    const fileUrl = String(formData.get("fileUrl") ?? "");
    const type = String(formData.get("type") ?? "");
    const category = String(formData.get("category") ?? "");
    const size = Number(formData.get("size") ?? "");

    const validationResult = MaterialsSchema.safeParse({
      title,
      key,
      url:fileUrl,
      type,
      category,
      size
    });

    if (!validationResult.success) {
      return {
        ...fromErrorToFormState(validationResult.error),
        values: {size, title, key, fileUrl, type, category },
      }
    }

    // Check quota before uploading
    const { storageUsed, storageLimit } = await getUserStorageUsage(userId);

    if (storageUsed + validationResult.data.size > storageLimit) {
      return toFormState("ERROR", "Przekroczono limit 20MB. Usuń niektóre pliki aby zwolnić miejsce.");
    }

    // Use transaction to insert material and update storage atomically
    await db.transaction(async (tx) => {
      // Insert material
      await tx.insert(materials).values({
        userId,
        title: validationResult.data.title,
        key: validationResult.data.key,
        url: validationResult.data.url,
        type: validationResult.data.type,
        category: validationResult.data.category,
        size: validationResult.data.size
      });

      // Update storage used
      await tx
        .update(userLimits)
        .set({
          storageUsed: sql`${userLimits.storageUsed} + ${validationResult.data.size}`,
          updatedAt: new Date(),
        })
        .where(eq(userLimits.userId, userId));
    });

  } catch (error: any) {
    return toFormState("ERROR", error.message );
  }

  revalidatePath("/panel/nauka");
  return toFormState("SUCCESS","Plik został pomyślnie wrzucony")
}

export async function deleteMaterialAction(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  try {
    const materialId = formData.get("materialId") as string

    if (!materialId) {
      return toFormState("ERROR", "Niepoprawne ID materiału")
    }

    const validationResult = DeleteMaterialIdSchema.safeParse({ materialId })

    if (!validationResult.success) {
      return toFormState("ERROR", "Brak materiału do usunięcia")
    }

    // Delete material and get the deleted record (includes size)
    const deletedMaterial = await deleteMaterial(userId, materialId)

    if (!deletedMaterial) {
      return toFormState("ERROR", "Materiał nie został znaleziony")
    }

    // Update storage used
    await db
      .update(userLimits)
      .set({
        storageUsed: sql`GREATEST(0, ${userLimits.storageUsed} - ${deletedMaterial.size})`,
        updatedAt: new Date(),
      })
      .where(eq(userLimits.userId, userId))
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath("/panel/nauka")
  return toFormState("SUCCESS", "Materiał został usunięty pomyślnie")
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
    // Verify ownership and delete
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