import path from "path"
import fs from "fs"
import { BlogPost, Procedure, Test } from "@/types/dataTypes"
import { CategoryMetadata, PopulatedCategories } from "@/types/categoryType"
import { getProcedureIdFromSlug } from "@/constants/procedureSlugs"
import {
  getMergedTests,
  getMergedTestsByCategory,
  getMergedCategories,
  countMergedTestsByCategory
} from "@/helpers/mergeTests"

interface FileDataOperations {
  getAllPosts: () => Promise<BlogPost[]>
  getPostById: (id: string) => Promise<BlogPost | null>
  getAllProcedures: () => Promise<Procedure[]>
  getProcedureById: (id: string) => Promise<Procedure | null>
  getProcedureBySlug: (slug: string) => Promise<Procedure | null>
  getAllTests: () => Promise<Test[]>
  getTestsCategories: () => Promise<{ category: string }[]>
  countTestsByCategory: (category: string) => Promise<number>
  getTestsByCategory: (category: string) => Promise<Test[]>
  getCategoriesMetadata: () => Promise<CategoryMetadata[]>
  // Merged variants (JSON official + DB user custom tests)
  // See @/helpers/mergeTests.ts for architecture details
  mergedGetAllTests: (userId?: string) => Promise<Test[]>
  mergedGetTestsByCategory: (category: string, userId?: string) => Promise<Test[]>
  mergedGetTestsCategories: (userId?: string) => Promise<{ category: string }[]>
  mergedCountTestsByCategory: (category: string, userId?: string) => Promise<number>
}

async function readJsonFile<T>(filename: string): Promise<T> {
  const dataPath = path.join(process.cwd(), "data", filename)
  const fileContents = await fs.promises.readFile(dataPath, "utf8")
  return JSON.parse(fileContents) as T
}

export const fileData: FileDataOperations = {
  getAllPosts: async () => {
    try {
      const posts = await readJsonFile<BlogPost[]>("blogPosts.json")
      return posts
    } catch (error) {
      console.error("Error fetching blog posts:", error)
      return []
    }
  },

  getPostById: async (id: string) => {
    try {
      const posts = await readJsonFile<BlogPost[]>("blogPosts.json")
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

  getProcedureById: async (id: string) => {
    try {
      const procedures = await readJsonFile<Procedure[]>("procedures.json")
      return procedures.find((procedure) => procedure.id === id) || null
    } catch (error) {
      console.error("Error fetching procedure:", error)
      return null
    }
  },

  getProcedureBySlug: async (slug: string) => {
    try {
      // Get ID from slug mapping
      const procedureId = getProcedureIdFromSlug(slug)
      if (!procedureId) {
        return null
      }

      // Fetch procedure by ID
      const procedures = await readJsonFile<Procedure[]>("procedures.json")
      return procedures.find((procedure) => procedure.id === procedureId) || null
    } catch (error) {
      console.error("Error fetching procedure by slug:", error)
      return null
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

  getCategoriesMetadata: async () => {
    try {
      const metadata = await readJsonFile<CategoryMetadata[]>("categoryMetadata.json");
      return metadata;
    } catch (error) {
      console.error("Error fetching category metadata:", error);
      return [];
    }
  },

  // Merged variants for supporter users (official + custom tests)
  mergedGetAllTests: async (userId?: string) => {
    return getMergedTests(userId)
  },

  mergedGetTestsByCategory: async (category: string, userId?: string) => {
    return getMergedTestsByCategory(category, userId)
  },

  mergedGetTestsCategories: async (userId?: string) => {
    return getMergedCategories(userId)
  },

  mergedCountTestsByCategory: async (category: string, userId?: string) => {
    return countMergedTestsByCategory(category, userId)
  },
}
