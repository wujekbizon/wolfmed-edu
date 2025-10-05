import TestsCategoryCardSkeleton from "./TestsCategoryCardSkeleton";

export default function TestsCategoriesListSkeleton() {
    return (
      <div className={`h-full w-full 2xl:w-3/4 flex flex-col mx-auto gap-4 md:gap-8`}>
        
          {[...Array(3)].map((_, index) => (
            <TestsCategoryCardSkeleton key={index} />
          ))}
  
      </div>
    );
  }