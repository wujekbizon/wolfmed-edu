import path from 'path'
import fs from 'fs'
import { Post, Procedure, Test } from '@/types/dataTypes'
import { Room } from '@teaching-playground/core'

interface FileDataOperations {
  getAllPosts: () => Promise<Post[]>
  getPostById: (id: string) => Promise<Post | null>
  getAllProcedures: () => Promise<Procedure[]>
  getAllTests: () => Promise<Test[]>
  getAllEvents: () => Promise<any[]>
  getAllRooms: () => Promise<Room[]>
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

  getAllProcedures: async () => {
    try {
      const procedures = await readJsonFile<Procedure[]>('procedures.json')
      return procedures
    } catch (error) {
      console.error('Error fetching procedures:', error)
      return []
    }
  },

  getAllTests: async () => {
    try {
      const tests = await readJsonFile<Test[]>('tests.json')
      return tests
    } catch (error) {
      console.error('Error fetching tests:', error)
      return []
    }
  },

  getAllEvents: async () => {
    try {
      const data = await readJsonFile<{ events: any[] }>('test-data.json')
      return data.events
    } catch (error) {
      console.error('Error fetching events:', error)
      return []
    }
  },

  getAllRooms: async () => {
    try {
      const data = await readJsonFile<{ rooms: Room[] }>('test-data.json')
      return data.rooms || []
    } catch (error) {
      console.error('Error fetching rooms:', error)
      return []
    }
  },
}
