import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { getUserPreferencesAction } from '@/actions/memory-actions'
import PreferencesForm from '@/components/memory/PreferencesForm'

export const metadata = {
  title: 'Ustawienia | Wolfmed',
  description: 'Ustaw swoje preferencje nauki — tutor dostosuje odpowiedzi do Twojego celu i stylu.',
}

export default async function SettingsPage() {
  const user = await currentUser()
  if (!user) redirect('/')

  const preferences = await getUserPreferencesAction()

  return (
    <div className="container mx-auto px-3 xs:px-4 sm:px-8 py-6 sm:py-8">
      <div className="max-w-xl">
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-800 mb-1">
          Preferencje nauki
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          Tutor uwzględnia te ustawienia w każdej odpowiedzi.
        </p>
        <PreferencesForm initial={preferences} />
      </div>
    </div>
  )
}
