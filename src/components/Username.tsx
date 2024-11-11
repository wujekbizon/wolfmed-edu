import { getUserUsername } from '@/server/queries'
import { currentUser } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'

export default async function Username() {
  const user = await currentUser()
  if (!user) notFound()
  const username = await getUserUsername(user.id)
  return (
    <h2 className="text-xl sm:text-2xl text-zinc-800 font-bold text-center sm:text-left">
      Panel użytkownika, <span className="text-[#f58a8a] font-semibold">{username}</span>
    </h2>
  )
}
