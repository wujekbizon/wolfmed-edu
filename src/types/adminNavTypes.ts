export type AdminNavBadgeKey = 'messages' | 'forum'

export type AdminNavLink = {
  href: string
  label: string
  badge?: AdminNavBadgeKey
}

export type AdminNavBadges = Record<AdminNavBadgeKey, number>

export type AdminNavVariant = 'desktop' | 'mobile'
