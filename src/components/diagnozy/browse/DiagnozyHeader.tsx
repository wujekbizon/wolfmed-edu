import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function DiagnozyHeader() {
  return (
    <header className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-zinc-800 mb-2">Diagnozy i Interwencje</h1>
        <p className="text-sm text-zinc-500 max-w-2xl">
          Diagnozy pielęgniarskie na podstawie podręcznika „Diagnozy i interwencje w
          praktyce pielęgniarskiej”. Przeczytaj opracowanie, a następnie wypełnij
          przewodnik procesu pielęgnowania, wybierając właściwe elementy.
        </p>
      </div>
      <Link
        href="/panel/diagnozy/egzamin"
        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full
          text-white bg-rose-500 hover:bg-rose-600 transition-colors"
      >
        <GraduationCap className="w-4 h-4" />
        Egzamin próbny
      </Link>
    </header>
  )
}
