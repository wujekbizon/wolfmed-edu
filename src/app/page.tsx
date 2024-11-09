import TestsSelection from './_components/TestsSelection'
import Hero from './_components/Hero'
import Contact from './_components/Contact'
import Footer from './_components/Footer'
import Membership from './_components/Membership'
import EarlySupporters from '@/components/EarlySupporters'
import GradientOverlay from '@/components/GradientOverlay'
import TriangleDivider from '@/components/TriangleDivider'
import About from './_components/About'

export default async function Home() {
  return (
    <section className="w-full h-full flex flex-col items-center overflow-hidden">
      <Hero />
      <div className="relative w-full h-[10vw] overflow-hidden">
        <TriangleDivider
          direction="right"
          className="absolute border-t-transparent border-r-white border-b-[10vw] border-b-white"
        />
        <GradientOverlay />
        <TriangleDivider
          direction="right"
          className="absolute bottom-0  border-t-transparent border-r-transparent border-b-[10vw] border-b-zinc-50"
        />
      </div>
      <Membership />
      <TriangleDivider
        direction="right"
        className="border-t-transparent border-r-purple-100 border-b-[10vw] border-b-[#e1b4b4]"
      />
      <TestsSelection />
      <TriangleDivider direction="left" className="border-t-[10vw] border-t-[#f8e3e3]  border-l-zinc-100" />
      <EarlySupporters />
      <TriangleDivider direction="left" className="border-t-[10vw] border-t-zinc-200 border-l-[#0d0b0b]" />
      <Contact />
      <About />
      <TriangleDivider direction="right" className="border-b-[10vw] border-r-[#0d0b0b] border-b-zinc-100" />
      <Footer />
    </section>
  )
}
