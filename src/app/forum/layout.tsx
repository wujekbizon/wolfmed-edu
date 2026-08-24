import { requireUser } from '@/helpers/requireUser'
import { connection } from 'next/server'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ForumLayout({ children }: { children: React.ReactNode }) {
  await connection()
  await requireUser()

  return (
    <main className="bg-linear-to-b from-zinc-500 via-purple-100 to-zinc-300 justify-center rounded-br-3xl lg:rounded-br-[50px] rounded-bl-3xl lg:rounded-bl-[50px] p-2">
      {children}
    </main>
  )
}
