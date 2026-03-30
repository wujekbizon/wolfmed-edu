import HeroButton from '@/components/HeroButton'
import Link from 'next/link'

export default async function HeroCallToActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4">
      <HeroButton link="/panel/nauka" className="sm:w-auto">
        Rozpocznij naukę
      </HeroButton>
      <Link
        href="/kierunki"
        className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3 rounded-full border border-zinc-700 bg-white/75 backdrop-blur-sm text-base sm:text-lg font-semibold text-zinc-800 shadow-md transition-all duration-300 ease-out hover:border-zinc-900 hover:bg-white/90 hover:shadow-lg hover:scale-105 active:scale-95"
      >
        Zobacz jak to działa
        <span aria-hidden className="text-zinc-600">→</span>
      </Link>
    </div>
  )
}