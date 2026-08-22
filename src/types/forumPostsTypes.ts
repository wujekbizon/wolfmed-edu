export type Comment = {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: string
}

export type Post = {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  authorRole: string
  createdAt: string
  updatedAt: string
  comments: Comment[]
  readonly: boolean
}

export type ForumData = {
  posts: Post[]
}

export type ForumNotifications = {
  newPosts: number
  newAdminPosts: number
  newComments: number
}

export type ForumStats = {
  total: number
  unanswered: number
  thisWeek: number
  thisMonth: number
  totalComments: number
}

export type RecentForumPost = {
  id: string
  title: string
  authorName: string
  authorRole: string
  createdAt: Date
  commentCount: number
}

export type ForumSeenScope = 'posts' | 'comments'

