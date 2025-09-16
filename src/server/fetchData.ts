import path from "path"
import fs from "fs"
import { Post, Procedure, Test } from "@/types/dataTypes"

interface FileDataOperations {
  getAllPosts: () => Promise<Post[]>
  getPostById: (id: string) => Promise<Post | null>
  getAllProcedures: () => Promise<Procedure[]>
  getAllTests: () => Promise<Test[]>
  getTestsCategories: () => Promise<{ category: string }[]>
  countTestsByCategory: (category: string) => Promise<number>
  getTestsByCategory: (category: string) => Promise<Test[]>
}

async function readJsonFile<T>(filename: string): Promise<T> {
  const dataPath = path.join(process.cwd(), "data", filename)
  const fileContents = await fs.promises.readFile(dataPath, "utf8")
  return JSON.parse(fileContents) as T
}

export const fileData: FileDataOperations = {
  getAllPosts: async () => {
    try {
      const posts = await readJsonFile<Post[]>("blogPosts.json")
      return posts
    } catch (error) {
      console.error("Error fetching blog posts:", error)
      return []
    }
  },

  getPostById: async (id: string) => {
    try {
      const posts = await readJsonFile<Post[]>("blogPosts.json")
      return posts.find((post) => post.id === id) || null
    } catch (error) {
      console.error("Error fetching blog post:", error)
      return null
    }
  },

  getAllProcedures: async () => {
    try {
      const procedures = await readJsonFile<Procedure[]>("procedures.json")
      return procedures
    } catch (error) {
      console.error("Error fetching procedures:", error)
      return []
    }
  },

  getAllTests: async () => {
    try {
      const tests = await readJsonFile<Test[]>("tests.json")
      return tests
    } catch (error) {
      console.error("Error fetching tests:", error)
      return []
    }
  },

  getTestsCategories: async () => {
    try {
      const tests = await readJsonFile<Test[]>("tests.json")
      const categories = [...new Set(tests.map((test) => test.category))].map(
        (category) => ({ category })
      )
      return categories
    } catch (error) {
      console.error("Error fetching tests:", error)
      return []
    }
  },

  countTestsByCategory: async (category: string) => {
    try {
      const tests = await readJsonFile<Test[]>("tests.json")
      const count = tests.filter((test) => test.category === category).length
      return count
    } catch (error) {
      console.error(`Error counting tests for category ${category}:`, error)
      return 0
    }
  },

  getTestsByCategory: async (category: string) => {
    try {
      const tests = await readJsonFile<Test[]>("tests.json")
      const filteredTests = tests
        .filter((test) => test.category === category)
        .sort((a, b) => {
          // Assuming 'id' can be compared as strings or numbers for consistent ordering
          // For truly descending ID, you might need a more robust comparison if IDs are not simple numbers
          if (a.id > b.id) return -1
          if (a.id < b.id) return 1
          return 0
        })
      return filteredTests
    } catch (error) {
      console.error(`Error fetching tests for category ${category}:`, error)
      return []
    }
  },
}
