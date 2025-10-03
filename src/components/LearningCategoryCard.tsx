import Link from "next/link";
import Image from "next/image";

interface LearningCategoryCardProps {
    item: { category: string; value: string; count: number };
}

export default function LearningCategoryCard({ item }: LearningCategoryCardProps) {
    const { category, value, count } = item;
    return (
        <Link href={`/panel/nauka/${value}`} className="flex items-center justify-center">
            <div className="relative flex flex-col w-full overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 shadow-lg transform transition-all duration-300 cursor-pointer backdrop-blur-sm backdrop-filter">
                <div className="relative w-full aspect-[16/9] p-4 flex flex-col justify-end items-start">
                    <Image
                        src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5hAALGCKaPSlWXcFVLft4M8kAgI2ECx19u7JN"
                        alt="Category Image"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover rounded-t-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10"></div>
                    <h3 className="relative z-20 text-2xl font-bold text-white drop-shadow-md leading-tight">
                        {category}
                    </h3>
                    <p className="relative z-20 text-sm text-zinc-300 mt-1">
                        Kompleksowe testy i pytania
                    </p>
                </div>
                <div className="relative z-10 flex flex-col justify-between p-4 h-1/2">
                    <p className="text-zinc-300 text-base leading-relaxed mb-4">
                        Przygotuj się do egzaminu {category} z naszymi
                        kompleksowymi testami i pytaniami. Bogata baza testów i pytań, które pomogą Ci w 100% przygotować sie do egzaminu
                        państwowego i zdać za pierwszym razem!
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                        <p className="text-zinc-200 text-base ">
                            <span className="text-xl font-bold text-red-300 mx-1">
                                {count}
                            </span>
                            pytań
                        </p>
                        <p className="text-red-300 text-lg font-bold">Rozpocznij naukę &rarr;</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
