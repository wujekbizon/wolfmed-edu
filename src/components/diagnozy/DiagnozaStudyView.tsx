import StudySection from '@/components/diagnozy/StudySection'
import StringListOrGrouped from '@/components/diagnozy/StringListOrGrouped'
import InterwencjeTable from '@/components/diagnozy/InterwencjeTable'
import type { Diagnoza } from '@/types/diagnozyTypes'

const ETIOLOGIA_LABELS = [
  ['patofizjologiczne', 'Patofizjologiczne'],
  ['zwiazaneZLeczeniem', 'Związane z leczeniem'],
  ['sytuacyjne', 'Sytuacyjne'],
  ['rozwojowe', 'Rozwojowe'],
] as const

export default function DiagnozaStudyView({ diagnoza }: { diagnoza: Diagnoza }) {
  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <StudySection title="Definicja">
        <p className="text-sm text-zinc-600">{diagnoza.definicja}</p>
      </StudySection>

      <StudySection title="Cechy charakteryzujące">
        <StringListOrGrouped data={diagnoza.cechyCharakteryzujace} />
      </StudySection>

      <StudySection title="Czynniki etiologiczne / ryzyka">
        <div className="space-y-4">
          {ETIOLOGIA_LABELS.map(([key, label]) =>
            diagnoza.czynnikiEtiologiczne[key].length > 0 ? (
              <div key={key}>
                <h4 className="text-sm font-semibold text-zinc-700 mb-1.5">{label}</h4>
                <StringListOrGrouped data={diagnoza.czynnikiEtiologiczne[key]} />
              </div>
            ) : null
          )}
        </div>
      </StudySection>

      <StudySection title="Kryteria rozpoznawania">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-zinc-700 mb-1.5">Subiektywne</h4>
            <StringListOrGrouped data={diagnoza.kryteriaRozpoznawania.subiektywne} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-700 mb-1.5">Obiektywne</h4>
            <StringListOrGrouped data={diagnoza.kryteriaRozpoznawania.obiektywne} />
          </div>
        </div>
      </StudySection>

      <StudySection title="Opis przypadku">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-zinc-700">
          {diagnoza.opisPrzypadku}
        </div>
      </StudySection>

      <StudySection title="Diagnoza pielęgniarska">
        <p className="text-sm text-zinc-700 font-medium bg-rose-50 border border-rose-200 rounded-xl p-4">
          {diagnoza.diagnozaPielegniarska}
        </p>
      </StudySection>

      <StudySection title="Cele opieki">
        <StringListOrGrouped data={diagnoza.celeOpieki} />
      </StudySection>

      <StudySection title="Interwencje pielęgniarskie">
        <InterwencjeTable interwencje={diagnoza.interwencje} />
      </StudySection>

      <StudySection title="Oczekiwane wyniki opieki">
        <p className="text-sm text-zinc-600">{diagnoza.oczekiwaneWyniki}</p>
      </StudySection>
    </div>
  )
}
