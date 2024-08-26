import TestsSelection from './_components/TestsSelection'
import Hero from './_components/Hero'

export default function Home() {
  return (
    <section className="w-full h-full gap-14 md:gap-28 flex flex-col items-center px-4 sm:px-6 pt-2 pb-2.5 sm:pt-4">
      <Hero />
      <TestsSelection />
    </section>
  )
}
