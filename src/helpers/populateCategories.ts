import "server-only";
import { CategoryMetadata, PopulatedCategories } from "@/types/categoryType";

export async function getPopulatedCategories(fileData: {
  getTestsCategories: () => Promise<{ category: string }[]>,
  countTestsByCategory: (cat: string) => Promise<number>,
  getCategoriesMetadata: () => Promise<CategoryMetadata[]>
}): Promise<PopulatedCategories[]> {
  const categories = await fileData.getTestsCategories();
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
      const count = await fileData.countTestsByCategory(cat.category);
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