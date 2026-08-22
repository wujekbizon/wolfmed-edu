import { requireUser } from '@/helpers/requireUser'

export default async function ForumLayout({ children }: { children: React.ReactNode }) {
  await requireUser()

  return (
    <main className="bg-linear-to-b from-zinc-500 via-purple-100 to-zinc-300 justify-center rounded-br-3xl lg:rounded-br-[50px] rounded-bl-3xl lg:rounded-bl-[50px] p-2">
      {children}
    </main>
  )
}
