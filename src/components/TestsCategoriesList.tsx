import { PopulatedCategories } from "@/types/categoryType";
import TestsCategoryCard from "./TestsCategoryCard";

export default function TestsCategoriesList({ categories }: { categories: PopulatedCategories[] }) {
  return (
    <div className={`h-full w-full 2xl:w-3/4 flex flex-col mx-auto gap-4 md:gap-8`}>
      {categories.map((item) => {
        return <TestsCategoryCard key={item.category} item={item} />;
      })}
    </div>
  );
}