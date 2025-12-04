import Link from 'next/link'

export default function PremiumLock() {
  return (
    <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
      <Link
        href="/wsparcie-projektu"
        className="px-4 py-2 bg-[#f58a8a]/90 text-white text-sm font-medium rounded-lg hover:bg-[#f58a8a] transition-all shadow-md"
      >
        Funkcja premium - Odblokuj
      </Link>
    </div>
  )
}
