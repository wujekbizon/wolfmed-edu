import { PopulatedCategories } from "@/types/categoryType";
import type { PracticeExamResume } from "@/types/practiceResumeTypes";
import TestsCategoryCard from "./TestsCategoryCard";

export default function TestsCategoriesList({
  categories,
  practiceAttempts,
}: {
  categories: PopulatedCategories[]
  practiceAttempts: PracticeExamResume[]
}) {
  return (
    <div className={`h-full w-full 2xl:w-3/4 flex flex-col mx-auto gap-4 md:gap-8`}>
      {categories.map((item) => {
        return <TestsCategoryCard
          key={item.category}
          item={item}
          practiceAttempts={practiceAttempts.filter((attempt) => attempt.category === item.value)}
        />;
      })}
    </div>
  );
}
