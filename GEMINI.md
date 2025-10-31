# Project Overview

This is a Next.js application for an educational platform called Wolfmed. It appears to be focused on medical education, providing tests, courses, and other educational materials. The platform uses a comprehensive technology stack, including:

*   **Framework:** Next.js with TypeScript
*   **Authentication:** Clerk
*   **Database:** PostgreSQL with Drizzle ORM and Neon
*   **Payments:** Stripe
*   **Styling:** Tailwind CSS
*   **Error Tracking:** Sentry
*   **Rich Text Editor:** Lexical
*   **State Management:** Zustand
*   **UI Components:** Radix UI (inferred from some of the components)

The application features a user-facing website, a forum, a blog, and a user dashboard. Users can register, take tests, track their progress, and interact with each other in the forum. The platform also includes a payment system for subscriptions and other services.

# Architecture Principles

## Server-First Approach
**This application strictly follows a server-first architecture using Next.js Server Actions.**

### Critical Rule: Database Interaction Pattern
**ALL user interactions that modify the database MUST follow this exact pattern:**

1. **User fills form** → Client-side form with inputs
2. **Form action triggered** → Server Action called with FormData
3. **Server-side authentication** → `await auth()` to verify user
4. **Zod validation** → Validate all input with defined schemas
5. **Database operation** → Query/mutation via centralized query functions
6. **User feedback** → Return FormState with success/error message
7. **Revalidation** → Update cached data via `revalidatePath()` or `revalidateTag()`

### What This Means
- ❌ **NEVER** query database directly from client components
- ❌ **NEVER** bypass Server Actions for mutations
- ❌ **NEVER** trust client input without Zod validation
- ✅ **ALWAYS** use Server Actions from `src/server/actions.ts`
- ✅ **ALWAYS** validate with schemas from `src/server/schema.ts`
- ✅ **ALWAYS** authenticate users before mutations
- ✅ **ALWAYS** use transactions for multi-step operations
- ✅ **ALWAYS** revalidate after successful mutations

For complete Server Actions documentation including patterns, security checklist, and examples, see `server-actions.md`.

# Database Architecture

## Schema Documentation
The database schema is fully documented in `schema.md`. Key points:

- **ORM:** Drizzle ORM with PostgreSQL
- **Table Prefix:** All tables use `wolfmed_` prefix via `pgTableCreator`
- **Main Tables:**
  - `wolfmed_users` - User accounts and profiles
  - `wolfmed_tests` - Test question banks
  - `wolfmed_procedures` - Medical procedure definitions
  - `wolfmed_test_sessions` - Active and completed test sessions
  - `wolfmed_completed_tests` - Test results
  - `wolfmed_notes` - User study notes with rich content (Lexical)
  - `wolfmed_materials` - User-uploaded files
  - `wolfmed_user_limits` - Storage quotas
  - `wolfmed_forum_posts` & `wolfmed_forum_comments` - Community discussions
  - `wolfmed_testimonials` - User reviews
  - `wolfmed_stripe_payments` & `wolfmed_stripe_subscriptions` - Payment tracking
  - `wolfmed_blog_posts` - Educational content
  - `wolfmed_user_cells_list` - Custom dashboard configurations

For detailed schema information including field types, relationships, indexes, and enums, refer to `schema.md`.

## Query Documentation
All database queries are documented in `queries.md`. Key points:

- **Location:** `src/server/queries.ts`
- **Caching:** All queries use React's `cache()` function for request deduplication
- **Categories:**
  - Test & Learning Queries (tests, procedures, sessions)
  - User Management Queries (profiles, stats, limits)
  - Forum Queries (posts, comments, rate limiting)
  - Payment Queries (Stripe integration)
  - Testimonial Queries (reviews management)
  - Notes Queries (CRUD operations with Lexical content)
  - Materials Queries (file management)
  - Custom Cells Queries (dashboard configuration)
  - Blog Queries (content management)

For detailed query signatures, parameters, usage examples, and best practices, refer to `queries.md`.

## Server Actions Documentation
All user mutations are handled through Server Actions documented in `server-actions.md`. Key points:

- **Location:** `src/server/actions.ts`
- **Directive:** All marked with `"use server"` at top of file
- **Patterns:** 5 standard patterns for different use cases (CRUD, rate-limited, multi-step, permissions, file uploads)
- **Security:** Mandatory authentication, Zod validation, permission checks, rate limiting
- **Transaction Safety:** Multi-step operations use database transactions
- **User Experience:** Form state preservation on errors, Polish error messages

For complete patterns, security checklist, and migration guide, refer to `server-actions.md`.

## Database Access Pattern
```typescript
// 1. Server Actions for mutations (user input)
// File: src/server/actions.ts
"use server"
export async function updateUsername(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  
  // Zod validation
  const result = UpdateUsernameSchema.safeParse({ ... })
  if (!result.success) return error
  
  // Database query
  await updateUsernameByUserId(userId, result.data.username)
  
  revalidatePath("/panel")
  return toFormState("SUCCESS", "Updated!")
}

// 2. Query functions for reads (no user input)
// File: src/server/queries.ts
import { getUserStats } from "@/server/queries"
const stats = await getUserStats(userId)

// 3. Use in components
// Client Component (with form):
"use client"
import { useActionState } from "react"
import { updateUsername } from "@/server/actions"

// Server Component (read-only):
import { getUserStats } from "@/server/queries"
async function Stats() {
  const stats = await getUserStats(userId)
  return <div>{stats.totalScore}</div>
}
```

# Building and Running

To build and run the project locally, follow these steps:

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
2.  **Set up environment variables:**
    Create a `.env.local` file and add the necessary environment variables, including the `NEON_DATABASE_URL` for the database connection and Clerk, Stripe, and Sentry API keys.
3.  **Run database migrations:**
    ```bash
    pnpm run db:push
    ```
4.  **Start the development server:**
    ```bash
    pnpm run dev
    ```
5.  **Set up webhooks:**
    The application uses webhooks for Clerk authentication. You will need to use a tool like Ngrok to expose your local development server to the internet and configure the webhook endpoints in the Clerk dashboard.

# Development Conventions

## Server Actions (Database Mutations)
*   **Mandatory Pattern:** ALL database mutations MUST use Server Actions
*   **Location:** `src/server/actions.ts` with `"use server"` directive
*   **Structure:** Authentication → Validation → Business Logic → Database → Revalidation
*   **Validation:** Use Zod schemas from `src/server/schema.ts` with `.safeParse()`
*   **Security:** 
    - Always check `await auth()` first
    - Verify permissions for delete/update operations
    - Implement rate limiting for user-generated content
    - Use transactions for multi-step operations
*   **User Feedback:** Return `FormState` with Polish error messages
*   **Revalidation:** Call `revalidatePath()` or `revalidateTag()` after success
*   **Complete Guide:** See `server-actions.md` for all patterns and examples

## Database
*   **ORM:** The project uses Drizzle ORM for database access
*   **Schema:** Database schema is defined in `src/server/db/schema.ts`
*   **Queries:** All read queries are centralized in `src/server/queries.ts` with full documentation in `queries.md`
*   **Actions:** All write operations use Server Actions in `src/server/actions.ts` with full documentation in `server-actions.md`
*   **Migrations:** The `drizzle-kit` CLI is used to manage database migrations
*   **Caching:** Use React's `cache()` function for query deduplication
*   **Type Safety:** All queries return properly typed data matching the schema definitions
*   **JSONB Fields:** 
    - Rich text content (Lexical editor state) stored as JSONB
    - Parse JSON strings when inserting: `JSON.parse(data.content)`
    - Return as typed objects when querying
*   **Date Handling:** Convert dates to ISO strings for client compatibility: `.toISOString()`
*   **Indexes:** Leverage existing indexes for optimal query performance (see `schema.md`)

## Styling
*   The project uses Tailwind CSS for styling
*   Utility classes are used directly in the JSX code

## Components
*   Well-organized component library in the `src/components` directory
*   Components are written in TypeScript and use React hooks
*   Follow existing component patterns for consistency

## Linting
*   The project uses ESLint for code linting
*   Linting rules are defined in the `eslint.config.mjs` file
*   Run the linter with:
    ```bash
    pnpm run lint
    ```

## Testing
*   The `Testing.md` file suggests that there are testing practices in place
*   It is recommended to review the existing tests and follow the same patterns when adding new features

# Key Development Guidelines

## Adding New Features with User Input

**When adding ANY feature that requires user input and database modification:**

1. **Define Zod schema** in `src/server/schema.ts`
   ```typescript
   export const NewFeatureSchema = z.object({
     field: z.string().min(1)
   })
   ```

2. **Create Server Action** in `src/server/actions.ts`
   ```typescript
   "use server"
   export async function newFeatureAction(formState: FormState, formData: FormData) {
     // Follow the standard pattern (see server-actions.md)
   }
   ```

3. **Create query function** (if needed) in `src/server/queries.ts`
   ```typescript
   export const getNewFeatureData = cache(async (userId: string) => {
     // Query logic
   })
   ```

4. **Use in client component**
   ```typescript
   "use client"
   import { useActionState } from "react"
   import { newFeatureAction } from "@/server/actions"
   
   const [state, action, pending] = useActionState(newFeatureAction, { status: "IDLE", message: "" })
   ```

**Never skip these steps. Never query database directly from client. Always follow the server-first pattern.**

## Working with the Database
1. **Always use existing queries** from `src/server/queries.ts` when possible
2. **Creating new queries:**
   - Add to `src/server/queries.ts`
   - Wrap with `cache()` for optimization
   - Follow existing naming conventions
   - Add type safety with proper return types
   - Document in `queries.md`
3. **Creating new mutations:**
   - Add Server Action to `src/server/actions.ts`
   - Create Zod schema in `src/server/schema.ts`
   - Follow standard pattern (see `server-actions.md`)
   - Document in `server-actions.md` if it's a new pattern
4. **Server-only:** Import `"server-only"` at the top of query files
5. **Authentication:** Use `@clerk/nextjs/server` for user authentication

## Data Relationships
- Use Drizzle's `with` clause for efficient joins
- Cascade deletes are configured for related data (see `schema.md`)
- Always check for null when querying related data

## Performance Considerations
- Queries on indexed fields are optimized (see `schema.md`)
- Use `.limit()` for large datasets
- Leverage caching with React's `cache()`
- Order results appropriately (typically newest first)
- Use transactions for multi-step operations to prevent partial updates

## File Structure
```
src/
├── server/
│   ├── db/
│   │   ├── schema.ts       # Database schema definitions
│   │   └── index.ts        # Database connection
│   ├── queries.ts          # All database queries (reads)
│   ├── actions.ts          # All Server Actions (writes)
│   └── schema.ts           # Zod validation schemas
├── components/             # React components
└── types/                  # TypeScript type definitions
```

# Documentation References

- **Schema Details:** See `schema.md` for complete database structure
- **Query Usage:** See `queries.md` for all available queries and usage examples
- **Server Actions:** See `server-actions.md` for mutation patterns, security, and best practices
- **Testing:** See `Testing.md` for testing guidelines (if available)

---

**Project Status:** Active Development  
**Last Updated:** October 31, 2024  
**Database:** PostgreSQL with Drizzle ORM  
**Framework:** Next.js 15+ with App Router  
**React:** 19+ (with Server Actions)