import PracticalExamCard from '@/components/PracticalExamCard'
import type { PublicExam } from '@/types/praktycznyTypes'

interface Props {
  exams: PublicExam[]
}

export default function PracticalExamList({ exams }: Props) {
  return (
    <section className="flex flex-col items-center w-full h-full overflow-y-auto scrollbar-webkit px-1 sm:px-4 py-8">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        <div className="px-2">
          <h1 className="text-2xl font-bold text-zinc-800">Egzamin praktyczny</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Wybierz arkusz z prawdziwej sesji egzaminacyjnej i wypełnij dokumentację jak na egzaminie
          </p>
        </div>

        {exams.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-zinc-400 text-base">Brak dostępnych arkuszy.</p>
          </div>
        ) : (
          <div className="grid gap-6 px-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {exams.map((exam) => (
              <PracticalExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
