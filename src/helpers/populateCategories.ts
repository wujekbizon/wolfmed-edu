import "server-only";
import { PopulatedCategories } from "@/types/categoryType";
import { DEFAULT_CATEGORY_METADATA, CATEGORY_METADATA } from "@/constants/categoryMetadata";
import { getCategories, countTestsByCategory } from "@/server/queries";
import { checkCourseAccessAction } from "@/actions/course-actions";
import { hasAccessToTier } from "@/helpers/accessTiers";

export async function getAccessibleCategories(): Promise<PopulatedCategories[]> {
  const populatedCategories = await getPopulatedCategories();

  const categoriesWithAccess = await Promise.all(
    populatedCategories.map(async (cat) => {
      const metadata = CATEGORY_METADATA[cat.value];
      if (!metadata?.course) return { ...cat, hasAccess: true };

      const courseAccess = await checkCourseAccessAction(metadata.course);
      if (!courseAccess.hasAccess) return { ...cat, hasAccess: false };

      const hasTierAccess = hasAccessToTier(
        courseAccess.accessTier || "free",
        metadata.requiredTier
      );

      return { ...cat, hasAccess: hasTierAccess };
    })
  );

  return categoriesWithAccess.filter((cat) => cat.hasAccess);
}

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
