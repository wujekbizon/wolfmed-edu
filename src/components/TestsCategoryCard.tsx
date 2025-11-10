import Image from "next/image";
import StartTestForm from "./StartTestForm";
import { PopulatedCategories } from "@/types/categoryType";
import { DEFAULT_CATEGORY_METADATA } from "@/constants/categoryMetadata";

export default async function TestsCategoryCard({ item }: { item: PopulatedCategories }) {
  const categoryData = item.data || DEFAULT_CATEGORY_METADATA;
  const isCustomCategory = !item.data;

  return (
    <div className="relative flex flex-col lg:flex-row w-full p-2 rounded-2xl bg-slate-900 transition-all duration-300 opacity-95 hover:opacity-100">
      <div className="relative h-72 lg:h-full w-full lg:w-1/3 rounded-xl">
        {categoryData.image ? (
          <Image
            src={categoryData.image}
            alt={item.category}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover border border-zinc-600 rounded-xl lg:rounded-l-xl lg:rounded-r-none"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-blue-600 to-purple-600 border border-zinc-600 rounded-xl lg:rounded-l-xl lg:rounded-r-none">
            <span className="text-8xl font-bold text-white uppercase">
              {item.category.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="relative z-10 flex w-full lg:w-2/3 flex-col gap-4 p-2 lg:p-6">
        <div className="flex flex-col items-start">
          <div className="flex gap-2 mb-4">
            {categoryData.status ? (
              <p className="rounded-full bg-green-500/20 px-2 py-1 text-sm text-green-500 border border-green-500/30">
                Dostępny online
              </p>
            ) : (
              <p className="rounded-full bg-red-500/20 px-2 py-1 text-sm text-red-500 border border-red-500/30">
                Niedostępny online
              </p>
            )}
            {isCustomCategory && (
              <p className="rounded-full bg-purple-500/20 px-2 py-1 text-sm text-purple-400 border border-purple-500/30">
                Twoja kategoria
              </p>
            )}
          </div>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-md leading-tight">
            {item.category}
          </h3>
          <p className="mt-2 text-zinc-300  text-sm md:text-base xl:text:lg leading-relaxed">
            {categoryData.description}
          </p>
        </div>

        <div className="flex justify-between items-center text-sm md:text-base xl:text:lg text-zinc-400">
          <p className="flex items-center max-h-3/4 text-zinc-800 bg-red-100 rounded-lg p-2">
            <span className="font-bold">
              {categoryData.popularity}
            </span>
          </p>
          <div className="flex flex-col justify-between items-start">
            <p className="text-zinc-200 text-sm md:text-base xl:text:lg">
              Dostępne pytania:
              <span className="font-bold text-red-300 mx-2">
                {item.count}
              </span>
            </p>
            <p className="flex items-center justify-end text-sm md:text-base xl:text:lg text-white">
              Czas trwania:
              <span className="text-red-300 font-bold mx-2">{categoryData.duration[0]}</span>
              minut
            </p>
          </div>
        </div>
        <div className="w-full border border-zinc-600 p-2 rounded-md bg-slate-950">
          <StartTestForm category={item} />
        </div>
      </div>
    </div>
  );
}
