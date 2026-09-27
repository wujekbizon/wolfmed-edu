import LinkButton from '@/components/ui/LinkButton'
import { PRACTICE_CATEGORY } from '@/constants/learningPractice'

export default function PracticeCategoryCta() {
  return <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200 sm:p-5">
    <div>
      <h3 className="font-semibold text-zinc-900">Karty nauki · Opiekun medyczny</h3>
      <p className="text-sm text-zinc-700">Przeglądaj karty i poznawaj materiał z Wolfkiem.</p>
    </div>
    <LinkButton href={`/panel/nauka/${PRACTICE_CATEGORY}`} size="lg">
      Ucz się z Wolfkiem
    </LinkButton>
  </section>
}
