import Hero from "./_components/Hero"
import Contact from "./_components/Contact"
import Footer from "./_components/Footer"
import ScrollReactiveBackground from "@/components/ScrollReactiveBackground"
import HeroStats from "@/components/HeroStats"
import About from "./_components/About"
import EducationPathsSection from "./_components/EducationalPaths"
import Testimonials from "./_components/Testimonials"
import FloatingInstagram from "@/components/FloatingInstagram"

export const dynamic = 'force-static'
export default function HomePage() {
  return (
    <div className="relative w-full bg-white">
      <ScrollReactiveBackground />
      <div className="relative z-10 flex flex-col items-center w-full overflow-x-hidden">
        <Hero />
        <HeroStats />
        <EducationPathsSection />
        <Testimonials />
        <About />
        <Contact />
        <Footer />
      </div>
      <FloatingInstagram />
    </div>
  )
}
