import Link from 'next/link'

interface DrawerNavLinkProps {
  href: string
  label: string
  icon: React.ReactNode
  active?: boolean
  locked?: boolean
  lockedTitle?: string
  onNavigate?: () => void
}

const ICON_BASE =
  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200'

export default function DrawerNavLink({
  href,
  label,
  icon,
  active = false,
  locked = false,
  lockedTitle,
  onNavigate
}: DrawerNavLinkProps) {
  if (locked) {
    return (
      <span
        title={lockedTitle}
        className="relative flex items-center gap-3.5 px-3 py-2 rounded-xl opacity-40 cursor-not-allowed select-none"
      >
        <span className={`${ICON_BASE} bg-white/50 border border-white/60`}>
          {icon}
        </span>
        <span className="text-sm font-medium text-zinc-700">{label}</span>
      </span>
    )
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group relative flex items-center gap-3.5 px-3 py-2 rounded-xl transition-all duration-200
        ${active
          ? 'text-rose-600'
          : 'text-zinc-700 hover:text-zinc-900 hover:bg-white/40'
        }`}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-rose-400" />
      )}
      <span
        className={`${ICON_BASE}
          ${active
            ? 'bg-gradient-to-br from-rose-400/25 to-red-300/15 shadow-sm shadow-rose-200/40'
            : 'bg-white/50 border border-white/60 group-hover:bg-white/70 group-hover:shadow-sm'
          }`}
      >
        <span className="transition-transform duration-200 group-hover:scale-110">
          {icon}
        </span>
      </span>
      <span className={`text-sm font-medium ${active ? 'font-semibold' : ''}`}>
        {label}
      </span>
    </Link>
  )
}
