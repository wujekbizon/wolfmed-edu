import TestsCategoryCard from "./TestsCategoryCard";

interface CategoriesListProps {
  categories: { category: string; value: string, count: number }[];
}

export default function TestsCategoriesList({ categories }: CategoriesListProps) {
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