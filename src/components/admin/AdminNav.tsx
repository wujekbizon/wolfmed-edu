import Link from 'next/link'
import { ADMIN_NAV_LINKS } from '@/constants/adminNavLinks'
import { FORUM_NOTIFICATION_BADGE_CAP } from '@/constants/forumNotifications'
import type { AdminNavBadges, AdminNavVariant } from '@/types/adminNavTypes'

const VARIANT_CLASS: Record<AdminNavVariant, string> = {
  desktop: 'hidden md:flex space-x-4',
  mobile: 'md:hidden pb-4 flex flex-wrap gap-2',
}

export default function AdminNav({
  variant,
  badges,
}: {
  variant: AdminNavVariant
  badges?: AdminNavBadges
}) {
  return (
    <nav className={VARIANT_CLASS[variant]}>
      {ADMIN_NAV_LINKS.map((link) => {
        const unread = link.badge ? (badges?.[link.badge] ?? 0) : 0

        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {link.label}
            {unread > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-xs font-bold leading-none">
                {unread > FORUM_NOTIFICATION_BADGE_CAP
                  ? `${FORUM_NOTIFICATION_BADGE_CAP}+`
                  : unread}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
