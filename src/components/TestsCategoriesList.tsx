import TestsCategoryCard from "./TestsCategoryCard";

interface CategoriesListProps {
    categories: { category: string; value: string }[];
  }
  
  export default function TestsCategoriesList({ categories }: CategoriesListProps) {
    return (
      <div className={`grid auto-rows-max gap-4 p-4 md:gap-8 lg:col-span-4`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.slice(1).map((item) => {
            return <TestsCategoryCard key={item.category} item={item} />;
          })}
        </div>
      </div>
    );
  }