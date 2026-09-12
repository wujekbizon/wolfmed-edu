import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AuthArtwork from './AuthArtwork'
import AuthGlassPanel from './AuthGlassPanel'
import type { AuthChildrenProps } from '@/types/authTypes'

export default function AuthShell({ children }: AuthChildrenProps) {
  return (
    <section
      className="auth-page-surface relative flex min-h-dvh items-center px-6 py-[clamp(24px,5vh,64px)] max-md:items-start max-md:px-3 max-md:py-6"
      aria-label="Konto Wolfmed"
    >
      <div className="relative mx-auto w-full max-w-6xl">
        <header className="mb-6 flex items-center justify-between gap-4 px-2 sm:mb-8">
          <Link
            href="/"
            aria-label="Wolfmed Edukacja — strona główna"
            className="text-sm font-extrabold tracking-[-0.035em] text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b83243] max-md:text-xs"
          >
            WOLFMED <span className="font-normal text-zinc-500">EDUKACJA</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b83243]"
          >
            <ArrowLeft size={14} aria-hidden />
            <span className="hidden sm:inline">Strona główna</span>
            <span className="sm:hidden">Wróć</span>
          </Link>
        </header>
        <AuthGlassPanel>
          <AuthArtwork />
          <div className="relative flex min-w-0 flex-col justify-center px-5 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
            <div className="mx-auto w-full max-w-[380px]">{children}</div>
          </div>
        </AuthGlassPanel>
        <footer className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-[11px] text-zinc-600 sm:mt-8">
          <Link href="/warunki" className="hover:text-zinc-900 hover:underline">Regulamin</Link>
          <Link href="/polityka-prywatnosci" className="hover:text-zinc-900 hover:underline">Polityka prywatności</Link>
        </footer>
      </div>
    </section>
  )
}
