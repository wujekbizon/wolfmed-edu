import path from "path"
import fs from "fs"
import { MaterialsType } from "@/types/materialsTypes"

interface FileDataOperations {
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
