import "server-only";
import { PopulatedCategories } from "@/types/categoryType";
import { DEFAULT_CATEGORY_METADATA, CATEGORY_METADATA } from "@/constants/categoryMetadata";
import { getCategories, countTestsByCategory } from "@/server/queries";

export async function getPopulatedCategories(): Promise<PopulatedCategories[]> {
  // Get categories directly from database
  const categories = await getCategories();

  const seen = new Set<string>();
  const uniqueCategories = categories.filter(cat => {
    const normalized = cat.meta.category.toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });

  return Promise.all(
    uniqueCategories.map(async (cat) => {
      const count = await countTestsByCategory(cat.meta.category);
      const metadata = CATEGORY_METADATA[cat.meta.category];

      return {
        category: formatCategoryName(cat.meta.category),
        value: cat.meta.category,
        count,
        data: metadata || { ...DEFAULT_CATEGORY_METADATA, category: cat.meta.category, course: cat.meta.course || '' },
      };
    })
  );
}

function formatCategoryName(name: string) {
  return name
    .replace(/-/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}