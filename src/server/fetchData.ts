import path from "path"
import fs from "fs"
import { Procedure } from "@/types/dataTypes"
import { CategoryMetadata } from "@/types/categoryType"
import { MaterialsType } from "@/types/materialsTypes"
import { getProcedureIdFromSlug } from "@/constants/procedureSlugs"

interface FileDataOperations {
  getAllProcedures: () => Promise<Procedure[]>
  getProcedureById: (id: string) => Promise<Procedure | null>
  getProcedureBySlug: (slug: string) => Promise<Procedure | null>
  getCategoriesMetadata: () => Promise<CategoryMetadata[]>
  getOfficialMaterials: () => Promise<MaterialsType[]>
}

// DEPRECATED: Use database queries instead of reading from JSON files
// Kept for backward compatibility with procedures, blog posts, and materials
async function readJsonFile<T>(filename: string): Promise<T> {
  const dataPath = path.join(process.cwd(), "data", filename)
  const fileContents = await fs.promises.readFile(dataPath, "utf8")
  return JSON.parse(fileContents) as T
}

export const fileData: FileDataOperations = {

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

      const procedures = await readJsonFile<Procedure[]>("procedures.json")
      return procedures.find((procedure) => procedure.id === procedureId) || null
    } catch (error) {
      console.error("Error fetching procedure by slug:", error)
      return null
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

  getOfficialMaterials: async () => {
    try {
      const materials = await readJsonFile<MaterialsType[]>("materials.json")
      return materials
    } catch (error) {
      console.error("Error fetching official materials:", error)
      return []
    }
  },
}
