# 🚀 Server Actions Documentation

## Overview
This document establishes the **strict server-first architecture** used in the Wolfmed application. All user interactions with the database follow a consistent pattern using Next.js Server Actions, ensuring security, validation, and proper error handling.

---

## 🎯 Core Philosophy

### Server-First Approach
**Every user interaction with the database MUST go through Server Actions.**

- ❌ **NO** direct database queries from client components
- ❌ **NO** API routes for form submissions (unless external webhooks)
- ✅ **YES** Server Actions with proper validation
- ✅ **YES** Zod schema validation on the server
- ✅ **YES** Authentication checks before any mutation

### Why Server Actions?
1. **Security**: User input never directly touches the database
2. **Validation**: Centralized Zod schemas prevent invalid data
3. **Type Safety**: End-to-end TypeScript from form to database
4. **DX**: No need to create API routes for every form
5. **Performance**: Automatic request deduplication and caching
6. **User Feedback**: Consistent error handling and success messages

---

## 📋 The Standard Pattern

Every Server Action follows this exact structure:

### 1. File Location
```
src/server/actions.ts
```
All Server Actions are centralized in a single file marked with `"use server"` directive.

### 2. Action Structure Template
```typescript
"use server"

export async function [actionName](
  formState: FormState,
  formData: FormData
) {
  // 1. AUTHENTICATION CHECK
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // 2. EXTRACT FORM DATA
  const field1 = formData.get("field1") as string
  const field2 = formData.get("field2") as string

  // 3. ZOD VALIDATION
  const validationResult = [SchemaName].safeParse({ field1, field2 })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { field1, field2 } // Return values for form persistence
    }
  }

  // 4. BUSINESS LOGIC & DATABASE OPERATIONS
  try {
    // Rate limiting checks
    // Permission checks
    // Database queries/mutations
    await db.insert(table).values(validationResult.data)
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { field1, field2 }
    }
  }

  // 5. REVALIDATION & SUCCESS
  revalidatePath("/relevant/path")
  return toFormState("SUCCESS", "Operation successful!")
}
```

---

## 🔒 Mandatory Rules

### Rule 1: Authentication First
**ALWAYS check authentication before any operation.**

```typescript
const { userId } = await auth()
if (!userId) throw new Error("Unauthorized")
```

**Location:** First line of every action that modifies data.

---

### Rule 2: Zod Validation Required
**NEVER trust client input. ALWAYS validate with Zod.**

```typescript
// Define schema in src/server/schema.ts
export const UpdateUsernameSchema = z.object({
  username: z.string().min(3).max(20)
})

// Use in action
const validationResult = UpdateUsernameSchema.safeParse({ username })

if (!validationResult.success) {
  return {
    ...fromErrorToFormState(validationResult.error),
    values: { username } // Preserve form state
  }
}
```

**Location:** All schemas in `src/server/schema.ts`

---

### Rule 3: Form State Management
**Use the FormState type for consistent error handling.**

```typescript
// Type definition (from types/actionTypes)
type FormState = {
  status: "IDLE" | "SUCCESS" | "ERROR"
  message: string
  timestamp?: number
  values?: Record<string, any> // Form values for persistence
}

// Success response
return toFormState("SUCCESS", "Operation successful!")

// Error response with form values
return {
  ...fromErrorToFormState(error),
  values: { field1, field2 }
}
```

---

### Rule 4: Transaction Safety
**Use database transactions for multi-step operations.**

```typescript
await db.transaction(async (tx) => {
  // Step 1: Verify/Lock records
  const [record] = await tx
    .select()
    .from(table)
    .where(eq(table.id, id))
    .for('update') // Lock row

  if (!record) throw new Error("Not found")

  // Step 2: Perform operations
  await tx.update(table).set({ ... })
  await tx.insert(otherTable).values({ ... })

  // All-or-nothing: if any step fails, everything rolls back
})
```

**When to use:**
- Multiple related database operations
- User stat updates + record creation
- Payment processing
- Any operation where partial completion would cause inconsistency

---

### Rule 5: Revalidation After Mutations
**Always revalidate affected paths/tags after successful mutations.**

```typescript
// Revalidate specific path
revalidatePath("/panel/wyniki")

// Revalidate multiple paths
revalidatePath("/panel")
revalidatePath("/forum")

// Revalidate by tag
revalidateTag("score")

// Redirect after success (automatically revalidates)
redirect("/panel/wyniki")
```

---

## 📚 Common Action Patterns

### Pattern 1: Simple CRUD Operation
```typescript
export async function updateUsername(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const username = formData.get("username") as string

  const validationResult = UpdateUsernameSchema.safeParse({ username })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { username }
    }
  }

  try {
    await updateUsernameByUserId(userId, validationResult.data.username)
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { username }
    }
  }

  revalidatePath("/panel")
  return toFormState("SUCCESS", "Username updated successfully!")
}
```

**Use for:** Profile updates, settings changes, simple edits

---

### Pattern 2: Rate-Limited Actions
```typescript
export async function createForumPostAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Extract and validate
  const title = formData.get("title") as string
  const content = formData.get("content") as string

  const validationResult = CreatePostSchema.safeParse({ title, content })
  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { title, content }
    }
  }

  try {
    // CHECK RATE LIMIT
    const lastPostTime = await getLastUserPostTime(userId)
    
    if (lastPostTime) {
      const timeSince = Date.now() - lastPostTime.getTime()
      const ONE_HOUR = 60 * 60 * 1000

      if (timeSince < ONE_HOUR) {
        const minutesRemaining = Math.ceil((ONE_HOUR - timeSince) / 60000)
        return toFormState(
          "ERROR",
          `You can create another post in ${minutesRemaining} minutes.`
        )
      }
    }

    // Proceed with creation
    await createForumPost({ ...validationResult.data, userId })
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { title, content }
    }
  }

  revalidatePath("/forum")
  return toFormState("SUCCESS", "Post created successfully!")
}
```

**Use for:** Forum posts, comments, any user-generated content that needs throttling

---

### Pattern 3: Complex Multi-Step Operations
```typescript
export async function submitTestAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const sessionId = formData.get("sessionId")
  if (!sessionId) return toFormState("ERROR", "No session ID")

  try {
    // 1. Check user limits
    const userTestLimit = await getUserTestLimit(userId)
    if (!userTestLimit || userTestLimit.testLimit <= 0) {
      return toFormState("ERROR", "Test limit exceeded")
    }

    // 2. Extract and validate answers
    const answers: QuestionAnswer[] = []
    formData.forEach((value, key) => {
      if (key.startsWith("answer-")) {
        answers.push({ [key]: value.toString() })
      }
    })

    const validationResult = CreateAnswersSchema.safeParse(answers)
    if (!validationResult.success) {
      return toFormState("ERROR", "Invalid answers")
    }

    // 3. Calculate score
    const { correct } = countTestScore(validationResult.data)
    const testResult = parseAnswerRecord(validationResult.data)

    // 4. Database transaction
    await db.transaction(async (tx) => {
      // Lock session
      const [session] = await tx
        .select()
        .from(testSessions)
        .where(
          and(
            eq(testSessions.id, sessionId),
            eq(testSessions.userId, userId),
            eq(testSessions.status, "ACTIVE")
          )
        )
        .for('update')

      if (!session) throw new Error("No active session")

      // Check expiry
      if (new Date() > session.expiresAt) {
        await tx
          .update(testSessions)
          .set({ status: "EXPIRED" })
          .where(eq(testSessions.id, session.id))
        throw new Error("Session expired")
      }

      // Update user stats
      await tx
        .update(users)
        .set({
          testLimit: sql`${users.testLimit} - 1`,
          testsAttempted: sql`${users.testsAttempted} + 1`,
          totalScore: sql`${users.totalScore} + ${correct}`,
          totalQuestions: sql`${users.totalQuestions} + ${testResult.length}`
        })
        .where(eq(users.userId, userId))

      // Insert completed test
      await tx.insert(completedTestes).values({
        userId,
        sessionId: session.id,
        score: correct,
        testResult
      })

      // Mark session complete
      await tx
        .update(testSessions)
        .set({ status: "COMPLETED", finishedAt: new Date() })
        .where(eq(testSessions.id, session.id))
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidateTag("score")
  redirect("/panel/wyniki")
}
```

**Use for:** Test submissions, payment processing, any operation requiring multiple coordinated updates

---

### Pattern 4: Permission-Based Actions
```typescript
export async function deletePostAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const postId = formData.get("postId") as string
  const authorId = formData.get("authorId") as string

  // PERMISSION CHECK
  if (userId !== authorId) {
    return toFormState("ERROR", "You don't have permission to delete this post")
  }

  try {
    await deleteForumPost(postId)
  } catch (error) {
    return fromErrorToFormState(error)
  }

  redirect("/forum")
}
```

**Use for:** Delete operations, edit operations, any action requiring ownership verification

---

### Pattern 5: File Upload Actions
```typescript
export async function uploadMaterialAction(
  FormState: FormState,
  formData: FormData
) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    // Extract file metadata (not the file itself - handled by upload service)
    const title = String(formData.get("title") ?? "")
    const key = String(formData.get("key") ?? "")
    const fileUrl = String(formData.get("fileUrl") ?? "")
    const type = String(formData.get("type") ?? "")
    const category = String(formData.get("category") ?? "")
    const size = Number(formData.get("size") ?? "0")

    const validationResult = MaterialsSchema.safeParse({
      title,
      key,
      url: fileUrl,
      type,
      category,
      size
    })

    if (!validationResult.success) {
      return {
        ...fromErrorToFormState(validationResult.error),
        values: { title, key, fileUrl, type, category, size }
      }
    }

    await db.insert(materials).values({
      userId,
      ...validationResult.data
    })
  } catch (error: any) {
    return toFormState("ERROR", error.message)
  }

  revalidatePath("/panel/nauka")
  return toFormState("SUCCESS", "File uploaded successfully")
}
```

**Use for:** Material uploads, profile pictures, any file-related operations

---

## 🔐 Security Checklist

Before deploying any new Server Action, verify:

- [ ] `"use server"` directive at top of file
- [ ] Authentication check (`await auth()`)
- [ ] Zod validation schema defined
- [ ] `.safeParse()` used (never `.parse()` directly)
- [ ] Error handling with try-catch
- [ ] Form values returned on validation error
- [ ] Permission checks for mutations
- [ ] Rate limiting for user-generated content
- [ ] Transaction used for multi-step operations
- [ ] Revalidation called after success
- [ ] User-friendly error messages (Polish language)

---

## 📝 Validation Schema Patterns

### Schema Location
All Zod schemas are defined in `src/server/schema.ts`

### Common Schema Patterns

#### Simple Field Validation
```typescript
export const UpdateUsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
})
```

#### Complex Object Validation
```typescript
export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(256, "Title too long"),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters"),
  readonly: z.boolean()
})
```

#### Array Validation
```typescript
export const CreateAnswersSchema = (allowedLengths: number[]) =>
  z
    .array(
      z.record(z.string(), z.string())
    )
    .refine(
      (arr) => allowedLengths.includes(arr.length),
      { message: `Array must have exactly ${allowedLengths.join(" or ")} items` }
    )
```

#### File Validation
```typescript
export const MaterialsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  key: z.string().min(1, "Key is required"),
  url: z.string().url("Invalid URL"),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  size: z.number().positive("Size must be positive")
})
```

---

## 🎨 Client-Side Integration

### Using Server Actions in Forms

#### Basic Form
```typescript
"use client"

import { useActionState } from "react"
import { updateUsername } from "@/server/actions"

export function UsernameForm() {
  const [state, action, pending] = useActionState(updateUsername, {
    status: "IDLE",
    message: ""
  })

  return (
    <form action={action}>
      <input 
        name="username" 
        defaultValue={state.values?.username}
        disabled={pending}
      />
      {state.status === "ERROR" && (
        <p className="text-red-500">{state.message}</p>
      )}
      {state.status === "SUCCESS" && (
        <p className="text-green-500">{state.message}</p>
      )}
      <button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  )
}
```

#### Form with Multiple Fields
```typescript
"use client"

import { useActionState } from "react"
import { createForumPostAction } from "@/server/actions"

export function CreatePostForm() {
  const [state, action, pending] = useActionState(createForumPostAction, {
    status: "IDLE",
    message: ""
  })

  return (
    <form action={action}>
      <input 
        name="title" 
        defaultValue={state.values?.title}
        placeholder="Post title"
      />
      <textarea 
        name="content" 
        defaultValue={state.values?.content}
        placeholder="Post content"
      />
      <label>
        <input type="checkbox" name="readonly" />
        Disable comments
      </label>
      
      {state.status === "ERROR" && (
        <p className="text-red-500">{state.message}</p>
      )}
      
      <button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create Post"}
      </button>
    </form>
  )
}
```

---

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: Missing Form Values on Error
**Problem:** User input is lost when validation fails

**Solution:** Always return form values in error state
```typescript
if (!validationResult.success) {
  return {
    ...fromErrorToFormState(validationResult.error),
    values: { field1, field2 } // ✅ Preserve input
  }
}
```

---

### Pitfall 2: Race Conditions in Transactions
**Problem:** Multiple operations on same record without locking

**Solution:** Use `FOR UPDATE` to lock rows
```typescript
await db.transaction(async (tx) => {
  const [session] = await tx
    .select()
    .from(testSessions)
    .where(eq(testSessions.id, sessionId))
    .for('update') // ✅ Lock the row
    
  // Now safe to update
})
```

---

### Pitfall 3: Forgetting Revalidation
**Problem:** UI doesn't reflect changes after mutation

**Solution:** Always revalidate after successful mutations
```typescript
await updateUsername(userId, newUsername)
revalidatePath("/panel") // ✅ Refresh the page data
return toFormState("SUCCESS", "Updated!")
```

---

### Pitfall 4: Direct Database Access from Client
**Problem:** Client components trying to query database

**Solution:** Always use Server Actions or Server Components
```typescript
// ❌ NEVER in client components
const data = await db.select()...

// ✅ Use Server Action
const handleSubmit = async (formData: FormData) => {
  "use server"
  const data = await db.select()...
}

// ✅ Or Server Component
async function ServerComponent() {
  const data = await db.select()...
  return <div>{data}</div>
}
```

---

### Pitfall 5: Weak Permission Checks
**Problem:** Users can modify others' data

**Solution:** Always verify ownership
```typescript
// ❌ Weak check
if (postId) {
  await deletePost(postId)
}

// ✅ Strong check
if (userId !== authorId) {
  return toFormState("ERROR", "Unauthorized")
}
await deletePost(postId)
```

---

## 📖 Action Reference Guide

### Quick Reference Table

| Action Name | Purpose | Rate Limited | Transaction | Permissions |
|-------------|---------|--------------|-------------|-------------|
| `startTestAction` | Start new test session | No | No | Supporter check for 40q tests |
| `submitTestAction` | Submit test answers | No | Yes | User must own session |
| `deleteTestAction` | Delete completed test | No | No | User must own test |
| `updateUsername` | Update profile username | No | No | Authenticated only |
| `updateMotto` | Update profile motto | No | No | Authenticated only |
| `createForumPostAction` | Create forum post | Yes (1/hour) | Yes | Authenticated only |
| `deletePostAction` | Delete forum post | No | No | User must be author |
| `createCommentAction` | Add forum comment | Yes (5/hour) | Yes | Post not readonly |
| `deleteCommentAction` | Delete forum comment | No | No | User must be author |
| `createTestimonialAction` | Create testimonial | No | No | Authenticated only |
| `uploadMaterialAction` | Upload study material | No | No | Storage limit check |
| `sendEmail` | Send contact message | No | No | None |
| `expireSessionAction` | Manually expire session | No | No | User must own session |

---

## 🔄 Migration Guide

### Converting API Routes to Server Actions

If you have existing API routes, follow this migration pattern:

#### Before (API Route)
```typescript
// app/api/update-username/route.ts
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return new Response("Unauthorized", { status: 401 })
  
  const body = await request.json()
  const { username } = body
  
  // Validation and update
  await updateUsername(session.userId, username)
  
  return Response.json({ success: true })
}
```

#### After (Server Action)
```typescript
// server/actions.ts
"use server"

export async function updateUsername(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const username = formData.get("username") as string

  const validationResult = UpdateUsernameSchema.safeParse({ username })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { username }
    }
  }

  try {
    await updateUsernameByUserId(userId, validationResult.data.username)
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values: { username }
    }
  }

  revalidatePath("/panel")
  return toFormState("SUCCESS", "Username updated!")
}
```

---

## 🎯 Decision Tree: When to Create a New Action

```
Is there user input that modifies database?
├─ YES → Create Server Action
│   ├─ Simple CRUD? → Use Pattern 1
│   ├─ Needs rate limiting? → Use Pattern 2
│   ├─ Multiple operations? → Use Pattern 3 (Transaction)
│   ├─ Requires ownership? → Use Pattern 4
│   └─ File upload? → Use Pattern 5
│
└─ NO → Can use:
    ├─ Server Component (for reads)
    ├─ Client Component with Server Action (for forms)
    └─ Query function (from queries.ts)
```

---

## 🏆 Best Practices Summary

1. **Always use Server Actions for mutations** - Never bypass this pattern
2. **One action = One responsibility** - Keep actions focused and simple
3. **Validate everything** - Never trust client input
4. **Return form values on error** - Improve UX by preserving input
5. **Use transactions** - For operations that must succeed or fail together
6. **Check permissions explicitly** - Don't rely on "should be safe"
7. **Rate limit user content** - Prevent spam and abuse
8. **Revalidate after mutations** - Keep UI in sync
9. **Provide Polish error messages** - User-facing errors in Polish
10. **Keep actions in one file** - Easier to maintain and review

---

## 📚 Additional Resources

- **Zod Documentation**: https://zod.dev
- **Next.js Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- **Drizzle Transactions**: https://orm.drizzle.team/docs/transactions
- **Clerk Auth**: https://clerk.com/docs

---

**Last Updated:** October 31, 2025  
**File Location:** `src/actions/actions.ts`  
**Next.js Version:** 15+  
**React Version:** 19+