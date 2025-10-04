import { PopulatedCategories } from "@/types/categoryType";
import TestsCategoryCard from "./TestsCategoryCard";

export default function TestsCategoriesList({ categories }: {categories: PopulatedCategories[]}) {
  return (
    <div className={`flex w-full flex-col gap-4 md:gap-8`}>
      <div className="flex flex-col gap-4">
        {categories.map((item) => {
          return <TestsCategoryCard key={item.category} item={item} />;
        })}
      </div>
    </div>
  );
}