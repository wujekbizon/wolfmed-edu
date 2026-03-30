import Hero from './_components/Hero'
import Contact from './_components/Contact'
import Footer from './_components/Footer'
import GradientOverlay from '@/components/GradientOverlay'
import About from './_components/About'
import EducationPathsSection from './_components/EducationalPaths'
import Testimonials from './_components/Testimonials'
import { FloatingShapes } from '@/components/FloatingShapes'

export const dynamic = 'force-static'
export default function HomePage() {
  return (
    <section className='relative w-full bg-white'>
      <div className='fixed inset-0 z-0 pointer-events-none'>
        <GradientOverlay />
        <FloatingShapes count={4} />
      </div>
      <div className='relative z-10 flex flex-col items-center w-full overflow-x-hidden'>
        <Hero />
        <EducationPathsSection />
        <Testimonials />
        <About />
        <Contact />
        <Footer />
      </div>
    </section>
  )
}
