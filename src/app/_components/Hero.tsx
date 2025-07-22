import GradientOverlay from '@/components/GradientOverlay'
import { FloatingShapes } from '@/components/FloatingShapes'
import HeroContent from './HeroContent'
import Simulation from './Simulation'

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100dvh-70px)] flex items-center justify-center overflow-hidden bg-white py-8 sm:py-12">
      <GradientOverlay />
      <FloatingShapes count={10}/>
      {/* <Simulation /> */}
      <HeroContent />
    </section>
  )
}
