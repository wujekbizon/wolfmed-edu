import HeroButton from '@/components/HeroButton'
import Link from 'next/link'

export default async function HeroCallToActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 sm:gap-4">
      <HeroButton link="/panel/nauka">Rozpocznij naukę</HeroButton>
      <Link
        href="/kierunki"
        className="inline-flex items-center gap-1.5 text-sm sm:text-base font-medium text-zinc-500 hover:text-zinc-800 transition-colors duration-200"
      >
        Zobacz jak to działa
        <span aria-hidden>→</span>
      </Link>
    </div>
  )
}
