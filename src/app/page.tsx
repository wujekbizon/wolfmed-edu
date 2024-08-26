import TestsSelection from './_components/TestsSelection'
import Hero from './_components/Hero'
import Contact from './_components/Contact'

export default function Home() {
  return (
    <section className="w-full h-full gap-14 md:gap-28 flex flex-col items-center">
      <Hero />
      <TestsSelection />
      <Contact />
    </section>
  )
}
