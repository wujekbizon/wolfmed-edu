import { getUserPreferencesAction } from '@/actions/memory-actions'
import PreferencesForm from '@/components/memory/PreferencesForm'

export default async function LearningPreferencesSection() {
  const preferences = await getUserPreferencesAction()

  return (
    <section>
      <h1 className="text-xl sm:text-2xl font-semibold text-zinc-800 mb-1">
        Preferencje nauki
      </h1>
      <p className="text-sm text-zinc-500 mb-6">
        Tutor uwzględnia te ustawienia w każdej odpowiedzi.
      </p>
      <PreferencesForm initial={preferences} />
    </section>
  )
}
