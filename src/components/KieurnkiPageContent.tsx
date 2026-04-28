import { Suspense } from "react";
import PathCarousel from "@/components/PathCarousel";
import NoCoursesBanner from "@/components/NoCoursesBanner";
import NoCoursesBannerSkeleton from "@/components/skeletons/NoCoursesBannerSkeleton";
import GradientOverlay from "@/components/GradientOverlay";
import { FloatingShapes } from "@/components/FloatingShapes";
import { careerPaths } from "@/constants/careerPathsData";

export default function KierunkiPageContent() {
    return (
        <>
        <Suspense fallback={<NoCoursesBannerSkeleton />}>
            <NoCoursesBanner />
        </Suspense>
        <section className="relative min-h-[calc(100dvh-80px)] pt-28 pb-16 md:pt-32 lg:pt-28 lg:pb-24 bg-white overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <GradientOverlay />
                <FloatingShapes count={3} />
            </div>
            <div className="relative w-full flex flex-col items-center justify-center px-4 pb-12 md:pb-14 lg:pb-16">
                <div className="max-w-2xl text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300/40 bg-white/50 px-3 py-1.5 text-xs font-medium text-red-500 backdrop-blur-sm mb-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        Platforma medyczna
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 text-zinc-800 leading-tight">
                        Wybierz swój{' '}
                        <span className="text-[#ff5b5b]">kierunek</span>
                    </h1>
                    <p className="text-base md:text-lg text-zinc-600 leading-relaxed max-w-xl mx-auto">
                        Znajdź program edukacyjny idealnie dopasowany do Twoich potrzeb i zacznij naukę już dziś.
                    </p>
                </div>
            </div>
            <div className="relative">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-zinc-200 to-transparent" />
                <div className="mx-0 lg:mx-8 xl:mx-16 shadow-2xl shadow-zinc-300/60 ring-1 ring-zinc-200/80 rounded-none lg:rounded-2xl overflow-hidden">
                    <PathCarousel paths={careerPaths} />
                </div>
                <div className="mt-10 mb-4 flex items-center justify-center gap-4 px-4">
                    <div className="h-px flex-1 max-w-[80px] bg-linear-to-r from-transparent to-zinc-300" />
                    <p className="text-sm font-semibold tracking-widest uppercase text-zinc-500">Platforma w liczbach</p>
                    <div className="h-px flex-1 max-w-[80px] bg-linear-to-l from-transparent to-zinc-300" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            <div className="h-7 w-7 rounded-full border-2 border-white bg-red-300" />
                            <div className="h-7 w-7 rounded-full border-2 border-white bg-red-400" />
                        </div>
                        <p className="text-sm text-zinc-500"><span className="font-semibold text-zinc-700">2</span> kierunki</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            <div className="h-7 w-7 rounded-full border-2 border-white bg-blue-300" />
                            <div className="h-7 w-7 rounded-full border-2 border-white bg-sky-300" />
                            <div className="h-7 w-7 rounded-full border-2 border-white bg-blue-400" />
                        </div>
                        <p className="text-sm text-zinc-500"><span className="font-semibold text-zinc-700">5000+</span> pytań testowych</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            <div className="h-7 w-7 rounded-full border-2 border-white bg-emerald-300" />
                            <div className="h-7 w-7 rounded-full border-2 border-white bg-teal-300" />
                            <div className="h-7 w-7 rounded-full border-2 border-white bg-emerald-400" />
                        </div>
                        <p className="text-sm text-zinc-500"><span className="font-semibold text-zinc-700">6 500+</span> studentów</p>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
}
