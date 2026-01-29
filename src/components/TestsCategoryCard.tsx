import Image from "next/image";
import StartTestForm from "./StartTestForm";
import { PopulatedCategories } from "@/types/categoryType";
import { DEFAULT_CATEGORY_METADATA } from "@/constants/categoryMetadata";

export default async function TestsCategoryCard({ item }: { item: PopulatedCategories }) {
  const categoryData = item.data || DEFAULT_CATEGORY_METADATA;
  const isCustomCategory = !item.data;
  const isLocked = item.hasAccess === false;

  return (
    <div className={`relative flex flex-col lg:flex-row w-full rounded-2xl bg-slate-900 transition-all duration-300 overflow-hidden ${
      isLocked ? 'opacity-50 cursor-not-allowed' : 'opacity-95 hover:opacity-100'
    }`}>
      <div className="relative h-64 sm:h-72 lg:h-auto w-full lg:w-2/5 xl:w-1/3 shrink-0">
        {categoryData.image ? (
          <Image
            src={categoryData.image}
            alt={item.category}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-linear-to-br from-blue-600 to-purple-600">
            <span className="text-7xl sm:text-8xl font-bold text-white uppercase">
              {item.category.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 p-4 sm:p-5 lg:p-6 xl:p-8 w-full">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-wrap gap-2">
            {categoryData.status ? (
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs sm:text-sm text-green-500 border border-green-500/30 font-medium">
                Dostępny online
              </span>
            ) : (
              <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs sm:text-sm text-red-500 border border-red-500/30 font-medium">
                Niedostępny online
              </span>
            )}
            {isCustomCategory && (
              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs sm:text-sm text-purple-400 border border-purple-500/30 font-medium">
                Twoja kategoria
              </span>
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-md leading-tight">
            {item.category}
          </h3>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            {categoryData.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center bg-red-100 rounded-lg px-3 py-2 min-h-[44px]">
            <span className="font-bold text-zinc-800 text-sm sm:text-base">
              {categoryData.popularity}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <span className="text-zinc-200">Dostępne pytania:</span>
              <span className="font-bold text-red-300">{item.count}</span>
            </div>
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <span className="text-zinc-200">Czas trwania:</span>
              <span className="font-bold text-red-300">{categoryData.duration.join(', ')}</span>
              <span className="text-zinc-200">minut</span>
            </div>
          </div>
        </div>

        <div className="w-full border border-zinc-600 rounded-lg bg-slate-950 p-3 sm:p-4">
          {isLocked ? (
            <div className="flex flex-col items-center justify-center py-4 gap-2">
              <div className="text-4xl">🔒</div>
              <p className="text-zinc-400 text-center font-medium">
                {item.lockedReason || 'Wymagane zakupienie kursu'}
              </p>
            </div>
          ) : (
            <StartTestForm category={item} />
          )}
        </div>
      </div>
    </div>
  );
}
