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
  createdAt: string
  updatedAt: string
  comments: Comment[]
}

export type ForumData = {
  posts: Post[]
}
