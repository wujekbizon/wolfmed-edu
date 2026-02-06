# CLAUDE.md

This file provides essential context for Claude Code (claude.ai/code) when working within the Wolfmed repository.  
It serves as the main entry point for understanding project structure and references to detailed technical documentation.

---

## 🩺 Project Overview

**Wolfmed** is a modern **medical education platform** built with **Next.js 16**, designed for interactive test-taking, procedural learning, and collaborative study.  

### Core Features
- **Test-Taking System** – Configurable medical tests with real-time feedback
- **Procedural Learning** – Step-by-step algorithmic training and visual recognition
- **Community Forum** – User discussion threads with moderation tools
- **Study Materials** – Rich text notes and file uploads with quotas
- **Payment System** – Stripe integration for subscriptions and supporter payments
- **Personalized Dashboards** – User-defined widgets for a tailored experience

---

## 🧰 Technology Stack

| Category | Tool |
|-----------|------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Authentication | Clerk |
| Payments | Stripe |
| UI | TailwindCSS v4, Framer Motion |
| State | Zustand |
| Rich Text | Lexical Editor |
| File Uploads | UploadThing |
| Package Manager | pnpm |

---

## 🗂️ Repository Structure

```
src/
├── app/            # Next.js App Router routes
├── server/         # Database + server-side logic
├── actions/        # Server Actions (validated with Zod)
├── components/     # Shared UI components
├── styles/         # Tailwind globals
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
└── lib/            # Utilities and configs
```

---

## 🎯 Component Architecture Patterns

### Modal Components

**Critical Rule**: Render modals at page/layout level, NOT in nested components.

**Problem**: `/panel/layout.tsx` has `position: relative` - breaks `position: fixed` modals rendered inside nested components.

**Solution Pattern**:
1. Lift modal state to page level
2. Pass `onOpenModal` callback down through components
3. Render modal component at page level, outside nested structure

**Example**:
```tsx
// ❌ WRONG - Modal in nested component (breaks with position: relative parent)
export default function Toolbar() {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <button onClick={() => setShowModal(true)}>Edit</button>
      {showModal && <EditModal />}  {/* Broken positioning */}
    </>
  )
}

// ✅ CORRECT - Modal at page level
export default function Page() {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <Toolbar onEditClick={() => setShowModal(true)} />
      {showModal && <EditModal />}  {/* Works correctly */}
    </>
  )
}
```

**Global Modals**: Use Zustand store for app-wide modals (confirmations, alerts). See `useConfirmModalStore` + `ConfirmModal` component.

**Alternative**: React portals (`createPortal`) can bypass positioning issues but add complexity.

---

## 🚀 Development Commands

```bash
pnpm run dev       # Start local development
pnpm run build     # Build for production
pnpm run start     # Run production server
pnpm run lint      # Run ESLint
```

### Database Operations
```bash
pnpm run db:push   # Push schema changes to the database
pnpm run db:studio # Open Drizzle Studio
```

---

## 📚 Reference Documentation

For detailed implementation patterns, refer to the following markdown files in the repository root:

| Topic | File |
|--------|------|
| **Database Schema** | [schema.md](./.claude/schema.md) |
| **Database Queries** | [queries.md](./.claude/queries.md) |
| **Server Actions & Validation** | [server-actions.md](./.claude/server-actions.md) |
| **Styling & Tailwind Configuration** | [tailwind-styles.md](./.claude/tailwind-styles.md) |

Each of these files contains specific conventions, examples, and best practices for their respective areas.  
Claude should defer to these files for deeper technical references.

---

## ✅ Agent Instructions

Claude (or any coding assistant) should follow these principles when interacting with this repository:

1. **Use this `CLAUDE.md`** for high-level project context.
2. **Reference linked markdown files** for detailed instructions (e.g., queries, schema, or styling).
3. **Avoid duplication** — rely on existing implementations in `/server`, `/actions`, or `/lib`.
4. **Follow Zod validation and server-first architecture** as described in `server-actions.md`.
5. **Use TailwindCSS v4 conventions** defined in `tailwind-styles.md`.
6. **Keep code clean and self-documenting** — Only add comments to code that is genuinely complex or difficult to understand. Prefer clear naming and simple logic over excessive commenting. Comments should explain "why", not "what".
7. **Check before creating** — Before adding any new function, query, or utility, search the codebase to verify it doesn't already exist. Use grep/search to check `/server/queries.ts`, `/actions`, and `/lib` for similar functionality.  

---

## 🧩 Summary

This simplified structure ensures:
- Faster project context loading for AI agents and developers  
- Clear separation between project overview and technical deep-dives  
- Reduced noise while maintaining full documentation coverage

---

© 2025 Wolfmed. All rights reserved.
