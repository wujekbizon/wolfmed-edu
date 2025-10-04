import "server-only";

import { PopulatedCategories } from "@/types/categoryType";


export async function getPopulatedCategories(fileData: {
  getTestsCategories: () => Promise<{ category: string }[]>,
  countTestsByCategory: (cat: string) => Promise<number>
}): Promise<PopulatedCategories[]> {
  const categories = await fileData.getTestsCategories();

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
      return {
        category: formatCategoryName(cat.category),
        value: cat.category,
        count,
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