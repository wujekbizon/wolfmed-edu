import Link from "next/link";
import Image from "next/image";
import { PopulatedCategories } from "@/types/categoryType";
import { DEFAULT_CATEGORY_METADATA } from "@/constants/categoryMetadata";

export default function LearningCategoryCard({ item }: { item: PopulatedCategories }) {
    const categoryData = item.data || DEFAULT_CATEGORY_METADATA;
    const isCustomCategory = !item.data;

    return (
        <Link href={`/panel/nauka/${item.value}`} className="flex items-center justify-center">
            <div className="relative flex flex-col w-full overflow-hidden rounded-2xl h-[450px] bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 shadow-lg transform transition-all duration-300 cursor-pointer backdrop-blur-sm backdrop-filter">
                <div className="relative w-full h-72 p-4 flex flex-col justify-end items-start">
                    {categoryData.image ? (
                        <Image
                            src={categoryData.image}
                            alt={`${item.category} image`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="h-full w-full object-cover rounded-t-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                            <span className="text-9xl font-bold text-white uppercase opacity-75">
                                {item.category.charAt(0)}
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10"></div>
                    <h3 className="relative z-20 text-2xl font-bold text-white drop-shadow-md leading-tight">
                        {item.category}
                    </h3>
                    <p className="relative z-20 text-sm text-zinc-300 mt-1">
                        {isCustomCategory ? 'Twoja kategoria' : 'Kompleksowe testy i pytania'}
                    </p>
                </div>
                <div className="relative z-10 flex flex-col justify-between p-4 h-1/2">
                    <p className="text-zinc-300 text-sm md:text-base xl:text:lg leading-relaxed mb-4">
                        {categoryData.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                        <p className="text-zinc-200 text-sm md:text-base xl:text:lg">
                            <span className="font-bold text-red-400 mx-1">
                                {item.count}
                            </span>
                            pytań
                        </p>
                        <p className="text-red-400 text-sm md:text-base xl:text:lg font-semibold hover:text-red-500">Rozpocznij naukę &rarr;</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
