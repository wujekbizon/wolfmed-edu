import { dnaIllustrationRows } from '@/constants/dnaIllustration'

export default function DnaIllustration() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <div className="flex rotate-35 flex-col items-center gap-3 max-md:scale-65">
        {dnaIllustrationRows.map((row, index) => (
          <div key={index} className={`relative h-2 rounded-full bg-linear-to-r from-[#ee987e]/70 to-[#c96376]/60 ${row} ${index === 6 ? 'mt-14' : ''}`}>
            <span className="absolute -top-1.5 -left-2 h-5 w-5 rounded-full bg-[radial-gradient(circle_at_30%_25%,#ffd6b7,#db7969_55%,#733445)] shadow-md" />
            <span className="absolute -top-1.5 -right-2 h-5 w-5 rounded-full bg-[radial-gradient(circle_at_30%_25%,#f4b4bd,#b7546b_55%,#582a40)] shadow-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
