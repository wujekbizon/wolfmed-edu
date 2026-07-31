import HeroContent from './HeroContent'
import HeroEntityField from '@/components/HeroEntityField'

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100dvh-70px)] flex items-center justify-center overflow-x-hidden py-8 sm:py-12">
      <HeroEntityField />
      <HeroContent />
    </section>
  )
}
