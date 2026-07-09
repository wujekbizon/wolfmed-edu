import Image from 'next/image'
import { Wand2 } from 'lucide-react'

const AI_CARD_IMAGE = 'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k5H6zCTyRXZAfUgQh6yMWki0EFjo5rbcJDS2mP'

export default function PracticalExamAICard() {
  return (
    <div className="relative flex flex-col lg:flex-row w-full rounded-2xl bg-slate-900 border border-violet-500/20 overflow-hidden">
      <div className="relative h-64 sm:h-72 lg:h-auto w-full lg:w-2/5 xl:w-1/3 shrink-0">
        <Image
          src={AI_CARD_IMAGE}
          alt="Egzamin generowany przez AI"
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/10 to-transparent lg:bg-linear-to-r" />
      </div>

      <div className="flex flex-col gap-4 lg:gap-5 p-5 sm:p-6 lg:p-8 w-full">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs sm:text-sm text-violet-300 border border-violet-500/30 font-medium">
              Generowane przez AI
            </span>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs sm:text-sm text-amber-300 border border-amber-500/30 font-medium">
              Wkrótce
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md leading-tight">
            Egzamin generowany przez AI
          </h3>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Wkrótce wygenerujesz nieograniczoną liczbę nowych arkuszy praktycznych. AI ułoży świeży
            przypadek pacjenta i karty do uzupełnienia w oparciu o wymagania egzaminu MED.14, a Ty
            sprawdzisz się tak samo jak na prawdziwych arkuszach.
          </p>
        </div>

        <div className="mt-auto pt-1">
          <span className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.06] text-zinc-400 text-sm font-semibold rounded-lg border border-white/10 cursor-not-allowed w-full sm:w-auto">
            <Wand2 className="w-4 h-4" />
            Już wkrótce
          </span>
        </div>
      </div>
    </div>
  )
}
