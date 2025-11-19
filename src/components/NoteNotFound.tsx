import Link from 'next/link'
import { ChevronLeft, BookOpen } from 'lucide-react'

export default function NoteNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fadeInUp opacity-0">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-linear-to-br from-rose-50 to-fuchsia-100/40 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <BookOpen className="w-10 h-10 text-[#ff9898]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Notatka nie została znaleziona
        </h2>
        <p className="text-zinc-600 mb-8 leading-relaxed">
          Ta notatka nie istnieje lub nie masz do niej dostępu
        </p>
        <Link
          href="/panel/nauka"
          className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#ff9898] to-[#ffc5c5] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Powrót do notatek
        </Link>
      </div>
    </div>
  )
}
