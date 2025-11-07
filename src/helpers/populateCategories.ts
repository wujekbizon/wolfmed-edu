import "server-only";
import { CategoryMetadata, PopulatedCategories } from "@/types/categoryType";

export async function getPopulatedCategories(
  fileData: {
    getTestsCategories: () => Promise<{ category: string }[]>,
    countTestsByCategory: (cat: string) => Promise<number>,
    getCategoriesMetadata: () => Promise<CategoryMetadata[]>,
    mergedGetTestsCategories: (userId?: string) => Promise<{ category: string }[]>,
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
    const normalized = cat.category.toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });

  return Promise.all(
    uniqueCategories.map(async (cat) => {
      const count = userId
        ? await fileData.mergedCountTestsByCategory(cat.category, userId)
        : await fileData.countTestsByCategory(cat.category);

      const metadata = categoriesMetadata.find(meta => meta.category === cat.category);

      return {
        category: formatCategoryName(cat.category),
        value: cat.category,
        count,
        data: metadata,
      } as PopulatedCategories;
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