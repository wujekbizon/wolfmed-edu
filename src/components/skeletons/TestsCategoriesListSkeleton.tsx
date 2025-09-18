import TestsCategoryCardSkeleton from "./TestsCategoryCardSkeleton";

export default function TestsCategoriesListSkeleton() {
    return (
      <div className={`flex w-full flex-col gap-4 md:gap-8`}>
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, index) => (
            <TestsCategoryCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }