import { getCurrentUser } from '@/server/user'
import Link from 'next/link'

export default async function SupporterStatus() {
  const user = await getCurrentUser()
  if (!user) return null


  if (user.supporter) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#ff9898]/20 to-rose-200/20 
        border border-[#ff9898]/30 shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-[#f58a8a]"
        >
          <path
            fillRule="evenodd"
            d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
          />
        </svg>
        <span className="text-sm font-medium text-[#f58a8a]">Wspierający</span>
      </div>
    )
  }

  return (
    <div
      className="bg-linear-to-r from-[#ff9898]/10 to-rose-100/10 backdrop-blur-sm 
      border border-[#ff9898]/20 px-4 py-3 rounded-lg shadow-sm"
      role="alert"
    >
      <div className="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-[#f58a8a]"
        >
          <path
            fillRule="evenodd"
            d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
          />
        </svg>
        <div>
          <strong className="font-bold text-[#f58a8a]">Wesprzyj nas!</strong>
          <span className="block sm:inline text-zinc-700">
            {' '}
            Wspieraj rozwój projektu i pomóż nam w jego dalszym tworzeniu.
          </span>
          <Link
            href="/wsparcie-projektu"
            className="ml-1 text-[#f58a8a] hover:text-[#ff9898] transition-colors underline decoration-[#ff9898]/30 hover:decoration-[#ff9898]"
          >
            Dowiedz się więcej
          </Link>
        </div>
      </div>
    </div>
  )
}
