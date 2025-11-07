import { getUserMotto } from '@/server/queries'
import { currentUser } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'

export default async function UserMotto() {
  const user = await currentUser()
  if (!user) notFound()
  const motto = await getUserMotto(user.id)

  return (
    <div
      className="w-full bg-linear-to-br from-[#ff9898]/5 via-zinc-100/10 to-[#ffc5c5]/5 backdrop-blur-sm p-5 sm:p-6 rounded-xl 
      border border-[#ff9898]/20 transition-all duration-300 group hover:bg-linear-to-br hover:from-[#ff9898]/10 hover:to-[#ffc5c5]/10"
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 sm:w-5 sm:h-5 text-[#f58a8a]"
          >
            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
          </svg>
          <span className="text-xs sm:text-sm uppercase tracking-wider text-zinc-600 font-medium">Twoje motto</span>
        </div>

        <p
          className="text-base sm:text-lg md:text-xl font-serif italic text-zinc-700 text-center 
          group-hover:text-zinc-800 transition-colors"
        >
          &quot;{motto}&quot;
        </p>
      </div>
    </div>
  )
}
