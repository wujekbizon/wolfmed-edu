import { getCurrentUser } from '@/server/user'

export default async function Username() {
  const user = await getCurrentUser()
  if (!user) return null
 
  return (
    <h2 className="text-xl sm:text-2xl text-zinc-800 font-bold text-center sm:text-left">
      Panel użytkownika, <span className="text-[#f58a8a] font-semibold">{user.username}</span>
    </h2>
  )
}
