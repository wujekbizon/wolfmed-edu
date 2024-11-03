import path from 'path'
import fs from 'fs'
import { Post } from '@/types/dataTypes'

interface FileDataOperations {
  getAllPosts: () => Promise<Post[]>
  getPostById: (id: string) => Promise<Post | null>
}

async function readJsonFile<T>(filename: string): Promise<T> {
  const dataPath = path.join(process.cwd(), 'data', filename)
  const fileContents = await fs.promises.readFile(dataPath, 'utf8')
  return JSON.parse(fileContents) as T
}

export const fileData: FileDataOperations = {
  getAllPosts: async () => {
    try {
      const posts = await readJsonFile<Post[]>('blogPosts.json')
      return posts
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }
  },

  getPostById: async (id: string) => {
    try {
      const posts = await readJsonFile<Post[]>('blogPosts.json')
      return posts.find((post) => post.id === id) || null
    } catch (error) {
      console.error('Error fetching blog post:', error)
      return null
    }
  },
}
