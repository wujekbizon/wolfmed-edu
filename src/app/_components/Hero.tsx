import GradientOverlay from '@/components/GradientOverlay'
import { FloatingShapes } from '@/components/FloatingShapes'
import HeroContent from './HeroContent'

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100dvh_-_70px)] flex items-center justify-center overflow-hidden bg-white py-8 sm:py-12">
      <GradientOverlay />
      <FloatingShapes />
      <HeroContent />
    </section>
  )
}
