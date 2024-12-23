import { ForumData, Post, Comment } from '@/types/forumPostsTypes'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const forumPath = path.join(process.cwd(), 'data/forum-posts.json')

// Helper function to read the JSON file
async function readForumData(): Promise<ForumData> {
  try {
    const data = await fs.readFile(forumPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist, return empty data structure
    return { posts: [] }
  }
}

// Helper function to write to the JSON file
async function writeForumData(data: ForumData): Promise<void> {
  await fs.writeFile(forumPath, JSON.stringify(data, null, 2))
}

// CRUD Operations
export async function getAllPosts(): Promise<Post[]> {
  const data = await readForumData()
  return data.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getPostById(postId: string): Promise<Post | null> {
  const data = await readForumData()
  return data.posts.find((post) => post.id === postId) || null
}

export async function createPost(title: string, content: string, authorId: string, authorName: string): Promise<Post> {
  const data = await readForumData()

  const newPost: Post = {
    id: uuidv4(),
    title,
    content,
    authorId,
    authorName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
  }

  data.posts.push(newPost)
  await writeForumData(data)

  return newPost
}

export async function updatePost(postId: string, updates: { title?: string; content?: string }): Promise<Post | null> {
  const data = await readForumData()
  const postIndex = data.posts.findIndex((post) => post.id === postId)

  if (postIndex === -1) return null

  data.posts[postIndex] = {
    ...data.posts[postIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  } as Post

  await writeForumData(data)
  return data.posts[postIndex]
}

export async function deletePost(postId: string): Promise<boolean> {
  const data = await readForumData()
  const initialLength = data.posts.length

  data.posts = data.posts.filter((post) => post.id !== postId)

  if (data.posts.length === initialLength) return false

  await writeForumData(data)
  return true
}

export async function addComment(
  postId: string,
  content: string,
  authorId: string,
  authorName: string
): Promise<Comment | null> {
  const data = await readForumData()
  const post = data.posts.find((p) => p.id === postId)

  if (!post) return null

  const newComment: Comment = {
    id: uuidv4(),
    content,
    authorId,
    authorName,
    createdAt: new Date().toISOString(),
  }

  post.comments.push(newComment)
  await writeForumData(data)

  return newComment
}

export async function deleteComment(postId: string, commentId: string): Promise<boolean> {
  const data = await readForumData()
  const post = data.posts.find((p) => p.id === postId)

  if (!post) return false

  const initialLength = post.comments.length
  post.comments = post.comments.filter((comment) => comment.id !== commentId)

  if (post.comments.length === initialLength) return false

  await writeForumData(data)
  return true
}
