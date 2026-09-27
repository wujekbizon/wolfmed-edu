import { BookOpenCheck } from 'lucide-react'
import type { LearningDeckHeaderProps } from '@/types/learningUiTypes'

export default function LearningDeckHeader({ count }: LearningDeckHeaderProps) {
  return <header className="learning-deck-header">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Twoje karty nauki</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">Ucz się w swoim rytmie</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">Odkrywaj, próbuj i pytaj. Wolfek jest obok, kiedy potrzebujesz pomocy.</p>
    </div>
    <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/80 px-4 py-2 text-sm text-zinc-600">
      <BookOpenCheck size={16} aria-hidden="true" />{count.toLocaleString('pl-PL')} kart
    </span>
  </header>
}
