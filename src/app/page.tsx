
import Hero from "./_components/Hero"
import Contact from "./_components/Contact"
import Footer from "./_components/Footer"
import EarlySupporters from "@/components/EarlySupporters"
import GradientOverlay from "@/components/GradientOverlay"
import TriangleDivider from "@/components/TriangleDivider"
import About from "./_components/About"
import EducationPathsSection from "./_components/EducationalPaths"
import Testimonials from "./_components/Testimonials"
import { connection } from "next/server"

export default function HomePage() {
  connection()
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
          className="absolute bottom-0  border-t-transparent border-r-transparent border-b-[10vw] border-b-slate-900"
        />
      </div>
      <EducationPathsSection />
      <TriangleDivider
        direction="left"
        className="border-t-[10vw] border-t-slate-900 border-l-violet-200"
      />
  
      <Testimonials />
      <TriangleDivider
        direction="left"
        className="border-t-[10vw] border-t-violet-200 border-l-zinc-950"
      />
      <About />
      <TriangleDivider
        direction="left"
        className="border-t-[10vw] border-t-zinc-950  border-l-zinc-100"
      />
      <EarlySupporters />
      <TriangleDivider
        direction="left"
        className="border-t-[10vw] border-t-zinc-200 border-l-[#0d0b0b]"
      />
      <Contact />
      <TriangleDivider
        direction="right"
        className="border-b-[10vw] border-r-zinc-900 border-b-zinc-100"
      />
      <Footer />
    </section>
  )
}
