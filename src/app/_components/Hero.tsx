import HeroContent from './HeroContent'
import ScrollButton from '@/components/ScrollButton'

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100dvh-70px)] flex items-center justify-center overflow-hidden py-8 sm:py-12">
      <HeroContent />
      <ScrollButton tag="explore" className="bottom-8" />
    </section>
  )
}
