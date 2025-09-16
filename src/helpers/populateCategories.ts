import "server-only";

import { Categories } from "@/types/categoryType";


export function populateCategories(
  categories: { category: string }[],
): Categories[] {
  const CATEGORY_OPTIONS: Categories[] = [];
  const existingCategories = new Set();

  for (const c of categories) {
    c.category = c.category.trim();

    if (CATEGORY_OPTIONS.length === 0) {
      CATEGORY_OPTIONS.push({
        category: "Select Category",
        value: "",
      });
    }

    // Check if category already exists (case-insensitive)
    const normalizedCategory = c.category.toLowerCase();

    if (!existingCategories.has(normalizedCategory)) {
      existingCategories.add(normalizedCategory);
      CATEGORY_OPTIONS.push({
        category: toTitleCase(c.category),
        value: normalizedCategory,
      });
    }
  }

  return CATEGORY_OPTIONS;
}

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
}