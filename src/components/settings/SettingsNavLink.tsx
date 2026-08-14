import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function SettingsNavLink({
  href,
  icon,
  title,
  description,
  onClick,
}: {
  href: string
  icon: ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between gap-4 rounded-lg -mx-2 px-2 py-2 transition-colors hover:bg-zinc-800/60"
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-medium text-zinc-200">{title}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
    </Link>
  )
}
