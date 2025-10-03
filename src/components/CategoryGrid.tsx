import LearningCategoryCard from "./LearningCategoryCard";

interface CategoryGridProps {
  categories: { category: string; value: string; count: number }[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="h-fit grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 w-full md:w-3/4 mx-auto py-8 px-3">
      {categories.map((item) => {
        return <LearningCategoryCard key={item.category} item={item} />;
      })}
    </div>
  );
}
