import "server-only";
import { CategoryMetadata, PopulatedCategories } from "@/types/categoryType";
import { DEFAULT_CATEGORY_METADATA } from "@/constants/categoryMetadata";
import { getCategories, countTestsByCategory } from "@/server/queries";
import { fileData } from "@/server/fetchData";

export async function getPopulatedCategories(): Promise<PopulatedCategories[]> {
  // Get categories directly from database
  const categories = await getCategories();
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
      const count = await countTestsByCategory(cat.meta.category);
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