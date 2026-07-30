import type { AdminNavLink } from '@/types/adminNavTypes'

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/posts', label: 'Posty' },
  { href: '/admin/posts/new', label: 'Nowy Post' },
  { href: '/admin/messages', label: 'Wiadomości', badge: 'messages' },
  { href: '/admin/forum', label: 'Forum', badge: 'forum' },
  { href: '/admin/categories', label: 'Kategorie' },
  { href: '/admin/rag', label: 'RAG' },
]
