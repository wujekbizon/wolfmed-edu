import { SignedIn } from '@clerk/nextjs'
import TestsSelection from './_components/TestsSelection'
import Hero from './_components/Hero'
import Contact from './_components/Contact'
import Footer from './_components/Footer'
import Membership from './_components/Membership'
import EarlySupporters from '@/components/EarlySupporters'
import GradientOverlay from '@/components/GradientOverlay'
import TriangleDivider from '@/components/TriangleDivider'

export default function Home() {
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
          className="absolute bottom-0  border-t-transparent border-r-transparent border-b-[10vw] border-b-[#e1b4b4]"
        />
      </div>
      <TestsSelection />
      <TriangleDivider
        direction="right"
        className="border-t-transparent border-r-[#e1b4b4] border-b-[10vw] border-b-zinc-50"
      />
      <Membership />
      <TriangleDivider direction="left" className="border-t-[10vw] border-t-zinc-800 border-l-zinc-100" />
      <EarlySupporters />
      <TriangleDivider direction="left" className="border-t-[10vw] border-t-zinc-200 border-l-zinc-900" />
      <SignedIn>
        <Contact />
      </SignedIn>
      <TriangleDivider direction="right" className="border-b-[10vw] border-r-zinc-900 border-b-zinc-100" />
      <div className="w-full h-full ">
        <Footer />
      </div>
    </section>
  )
}
