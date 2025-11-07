import { PopulatedCategories } from "@/types/categoryType";
import LearningCategoryCard from "./LearningCategoryCard";

export default function CategoryGrid({ categories }: {categories: PopulatedCategories[]}) {
  return (
    <div className="h-fit grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
      {categories.map((item) => {
        return <LearningCategoryCard key={item.category} item={item} />;
      })}
    </div>
  );
}
