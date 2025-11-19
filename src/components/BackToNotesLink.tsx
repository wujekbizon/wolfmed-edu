import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function BackToNotesLink() {
  return (
    <Link
      href="/panel/nauka"
      className="inline-flex items-center gap-2 text-zinc-600 hover:text-[#ff9898] transition-all duration-200 my-8 text-sm group animate-fadeInUp opacity-0"
    >
      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
      Powrót do listy notatek
    </Link>
  )
}
