import HeroContent from './HeroContent'
import HeroEntityField from '@/components/HeroEntityField'
import ScrollButton from '@/components/ScrollButton'

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100dvh-70px)] flex items-center justify-center overflow-x-hidden pt-8 pb-24 sm:py-12">
      <HeroEntityField />
      <HeroContent />
      <ScrollButton tag="explore" className="bottom-8" />
    </section>
  )
}
