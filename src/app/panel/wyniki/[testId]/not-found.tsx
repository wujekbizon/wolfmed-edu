import Link from 'next/link'
import { SearchX, ArrowLeft, LayoutGrid } from 'lucide-react'

export default function ResultNotFound() {
  return (
    <aside className="w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center p-8 bg-background">

      <div 
        className="flex flex-col items-center max-w-md w-full p-8 sm:p-12 bg-white/80 backdrop-blur-sm border border-[#ff9898]/30 rounded-2xl shadow-lg animate-[scaleIn_0.5s_ease-out_forwards] opacity-0"
        style={{ '--slidein-delay': '0.1s' } as React.CSSProperties}
      >

        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#ff9898] opacity-20 blur-2xl rounded-full animate-pulse" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-[#ff9898]/10 to-[#ffc5c5]/10 rounded-2xl flex items-center justify-center border border-[#ff9898]/20 rotate-3">
            <SearchX className="w-10 h-10 text-[#ff9898]" strokeWidth={1.5} />
          </div>
        </div>

        <div 
          className="text-center animate-fadeInUp opacity-0"
          style={{ '--slidein-delay': '0.3s' } as React.CSSProperties}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
            Nie znaleziono wyniku
          </h2>
          <p className="text-zinc-600 mb-10 leading-relaxed">
            Ten test nie istnieje lub został usunięty. Sprawdź poprawność linku lub skorzystaj z nawigacji poniżej.
          </p>
        </div>

        <div 
          className="flex flex-col gap-4 w-full animate-fadeInUp opacity-0"
          style={{ '--slidein-delay': '0.5s' } as React.CSSProperties}
        >
          <Link
            href="/panel/wyniki"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-[#ff9898] to-[#ffc5c5] text-white font-semibold rounded-xl hover:shadow-md hover:shadow-[#ff9898]/30 transition-all active:scale-[0.98] text-sm sm:text-base border border-[#ff9898]/40"
          >
            <LayoutGrid className="w-4 h-4" />
            Zobacz wszystkie wyniki
          </Link>
          
          <Link
            href="/panel"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 text-zinc-600 font-medium rounded-xl border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do panelu
          </Link>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-zinc-400 text-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-[#ff9898]/40" />
        <span>Platforma Wolfmed Edukacja</span>
      </div>
    </aside>
  )
}