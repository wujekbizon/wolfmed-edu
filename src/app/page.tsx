import TestsSelection from './_components/TestsSelection'
import Hero from './_components/Hero'

export default function Home() {
  return (
    <section className="w-full h-full gap-14 md:gap-28 flex flex-col items-center">
      <Hero />
      <TestsSelection />
    </section>
  )
}
