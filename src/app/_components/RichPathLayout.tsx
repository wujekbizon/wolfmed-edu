import { PathLayoutProps } from "@/types/careerPathsTypes";
import GradientOverlay from "@/components/GradientOverlay";
import CurriculumMap from "../../components/CurriculumMap";
import PricingSection from "@/components/pricing/PricingSection";
import SimplePathCard from "@/components/SimplePathCard";

export default function RichPathLayout({
  title,
  description,
  curriculum,
  features,
  pricing,
  ownedCourses,
  subjectYears
}: PathLayoutProps) {
  return (
    <section className="relative @container flex flex-col w-full bg-white p-4 sm:p-6 md:p-8 lg:p-12 gap-8 sm:gap-12 lg:gap-16 overflow-hidden">
      <GradientOverlay />

      <div className="relative w-full">
        <div className="flex flex-col items-center text-center">
          <span className="mb-3 sm:mb-4 inline-block rounded-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-600">
            Kierunek Edukacyjny
          </span>
          <h1 className="mb-2 lg:mb-4 max-w-2xl text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 p-2 leading-14">
            {title}
          </h1>
          <p className="mb-8 sm:mb-16 max-w-3xl text-zinc-500 text-base sm:text-xl font-normal leading-6 tracking-[-0.14px] text-center">
            {description}
          </p>
        </div>
      </div>

      <section aria-labelledby="curriculum-title" className="relative w-full p-4 sm:p-8 bg-white">
        <header className="mb-6 sm:mb-10 text-center">
          <span className="inline-block rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium tracking-wide">
            Program nauczania
          </span>
          <h2 id="curriculum-title" className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
            Szczegółowa mapa programu
          </h2>
          <p className="mt-3 text-zinc-600 text-base md:text-lg">
            Przeglądaj przedmioty według roku. Rozwiń moduły, aby zobaczyć liczbę godzin, ECTS i formę zaliczenia.
          </p>
        </header>
        <div className="mx-auto w-full max-w-none lg:max-w-6xl">
          <CurriculumMap curriculum={curriculum ?? []} />
        </div>
      </section>

      {features && features.length > 0 && (
        <section aria-labelledby="features-title" className="w-full relative">
          <header className="mb-8 sm:mb-12 lg:mb-16 text-center">
            <span className="inline-block rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm text-slate-700 px-3 py-1 text-xs font-medium tracking-wide">
              Co oferujemy
            </span>
            <h2
              id="features-title"
              className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900"
            >
              Cechy kierunku i narzędzia
            </h2>
            <p className="mt-3 text-zinc-600 text-base md:text-lg">
              Praktyczne moduły i materiały, które realnie pomogą Ci w nauce i
              przygotowaniu do egzaminu.
            </p>
          </header>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <SimplePathCard key={index} {...feature} />
            ))}
          </div>
        </section>
      )}

      {pricing && (
        <PricingSection
          pricing={pricing}
          ownedCourses={ownedCourses ?? []}
          years={subjectYears}
        />
      )}
    </section>
  );
}
