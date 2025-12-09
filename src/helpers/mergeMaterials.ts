import { fileData } from "@/server/fetchData"
import { MaterialsType } from "@/types/materialsTypes"

/**
 * MATERIALS MERGING ARCHITECTURE
 *
 * IMPLEMENTATION:
 * - Official materials: data/materials.json (file system)
 * - User materials: wolfmed_materials table (database)
 * - This function merges both sources into unified MaterialsType[] array
 *
 * The separation between "official" and "user" materials ensures proper
 * ownership and prevents users from deleting system materials.
 */

/**
 * Merge official materials (JSON) with user's materials (DB)
 * @param userMaterials - User uploaded materials from database
 * @returns Combined array of official + user materials
 */
export async function getMergedMaterials(userMaterials: MaterialsType[]): Promise<MaterialsType[]> {
  // 1. Fetch official materials from JSON
  const officialMaterials = await fileData.getOfficialMaterials()

  // 2. Merge: official first, then user materials
  return [...officialMaterials, ...userMaterials]
}
