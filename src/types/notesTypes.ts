export type NotesType = {
  createdAt: string
  updatedAt: string
  title: string
  content: unknown
  plainText: string | null
  excerpt: string | null
  category: string
  tags: unknown
  pinned: boolean
  id: string
  userId: string
}
