import { requireUser } from '@/helpers/requireUser'
import { connection } from 'next/server'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  await connection()
  await requireUser()

  return (
    <main>
      {children}
    </main>
  )
}
