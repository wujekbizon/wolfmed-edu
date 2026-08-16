import CurriculumMap from '@/components/CurriculumMap'
import { CURRICULUM_ANCHOR } from '@/constants/curriculumAnchor'
import type { PathLayoutProps } from '@/types/careerPathsTypes'

export default function PathCurriculumSection({
  curriculum,
}: {
  curriculum: PathLayoutProps['curriculum']
}) {
  return (
    <section
      id={CURRICULUM_ANCHOR}
      aria-labelledby="curriculum-title"
      className="relative w-full scroll-mt-24 p-4 sm:p-8"
    >
      <header className="mb-6 text-center sm:mb-10">
        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium tracking-wide text-slate-700">
          Program nauczania
        </span>
        <h2
          id="curriculum-title"
          className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl lg:text-4xl"
        >
          Szczegółowa mapa programu
        </h2>
        <p className="mt-3 text-base text-zinc-600 md:text-lg">
          Przeglądaj przedmioty według roku. Rozwiń moduły, aby zobaczyć liczbę
          godzin, ECTS i formę zaliczenia.
        </p>
      </header>
      <div className="mx-auto w-full max-w-none lg:max-w-6xl">
        <CurriculumMap curriculum={curriculum ?? []} />
      </div>
    </section>
  )
}
