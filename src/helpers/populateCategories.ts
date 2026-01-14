import "server-only";
import { CategoryMetadata, PopulatedCategories } from "@/types/categoryType";
import { DEFAULT_CATEGORY_METADATA } from "@/constants/categoryMetadata";

export async function getPopulatedCategories(
  fileData: {
    getTestsCategories: () => Promise<{ meta: { category: string; course: string } }[]>,
    countTestsByCategory: (cat: string) => Promise<number>,
    getCategoriesMetadata: () => Promise<CategoryMetadata[]>,
    mergedGetTestsCategories: (userId?: string) => Promise<{ meta: { category: string; course: string } }[]>,
    mergedCountTestsByCategory: (cat: string, userId?: string) => Promise<number>
  },
  userId?: string
): Promise<PopulatedCategories[]> {
  // Use merged functions if userId provided, otherwise use original
  const categories = userId
    ? await fileData.mergedGetTestsCategories(userId)
    : await fileData.getTestsCategories();

  const categoriesMetadata = await fileData.getCategoriesMetadata();
  const seen = new Set<string>();
  const uniqueCategories = categories.filter(cat => {
    const normalized = cat.meta.category.toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });

  return Promise.all(
    uniqueCategories.map(async (cat) => {
      const count = userId
        ? await fileData.mergedCountTestsByCategory(cat.meta.category, userId)
        : await fileData.countTestsByCategory(cat.meta.category);

      const metadata = categoriesMetadata.find(meta => meta.category === cat.meta.category);

      return {
        category: formatCategoryName(cat.meta.category),
        value: cat.meta.category,
        count,
        data: metadata || { ...DEFAULT_CATEGORY_METADATA, category: cat.meta.category },
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