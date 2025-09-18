import TestsCategoryCard from "./TestsCategoryCard";

interface CategoriesListProps {
    categories: { category: string; value: string }[];
  }
  
  export default function TestsCategoriesList({ categories }: CategoriesListProps) {
    return (
      <div className={`flex w-full flex-col gap-4 md:gap-8`}>
        <div className="flex flex-col gap-4">
          {categories.slice(1).map((item) => {
            return <TestsCategoryCard key={item.category} item={item} />;
          })}
        </div>
      </div>
    );
  }