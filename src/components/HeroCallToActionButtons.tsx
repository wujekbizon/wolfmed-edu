import HeroButton from '@/components/HeroButton'
import Link from 'next/link'

export default async function HeroCallToActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 sm:gap-4">
      <HeroButton link="/panel/nauka">Rozpocznij naukę</HeroButton>
      <Link
        href="/kierunki"
        className="inline-flex items-center gap-2 px-8 md:px-12 py-2.5 md:py-3.5 rounded-full border border-zinc-300/60 bg-white/50 backdrop-blur-sm text-base sm:text-lg md:text-xl font-semibold text-zinc-600 shadow-sm transition-all duration-300 ease-out hover:border-zinc-400/80 hover:bg-white/70 hover:text-zinc-800 hover:shadow-md hover:scale-105 active:scale-95"
      >
        Zobacz jak to działa
        <span aria-hidden className="text-zinc-400">→</span>
      </Link>
    </div>
  )
}
