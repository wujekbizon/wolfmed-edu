/**
 * Maps test categories to their parent courses
 * This determines which course enrollment is required to access specific test categories
 */
export const COURSE_CATEGORY_MAPPING: Record<string, string> = {
  // Opiekun Medyczny categories
  "opiekun-medyczny": "opiekun-medyczny",

  // Pielęgniarstwo categories (example - add your actual categories)
  "fizjologia": "pielegniarstwo",
  "anatomia": "pielegniarstwo",
  "farmakologia": "pielegniarstwo",
  "patologia": "pielegniarstwo",
  "socjologia": "pielegniarstwo",

  // Add more category mappings as you create test files
};

/**
 * Get the course slug for a given test category
 */
export function getCourseForCategory(category: string): string | null {
  return COURSE_CATEGORY_MAPPING[category] || null;
}
