import HeroContent from './HeroContent'

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100dvh-70px)] flex items-center justify-center overflow-hidden py-8 sm:py-12">
      <HeroContent />
    </section>
  )
}
