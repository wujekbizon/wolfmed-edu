import { requireAdmin } from '@/helpers/requireAdmin'
import { getDefaultWolfekAdminFilters } from '@/helpers/getDefaultWolfekAdminFilters'
import { WolfekAdminFiltersSchema } from '@/server/schema'
import { getWolfekAdminReport } from '@/server/wolfek-admin/getWolfekAdminReport'
import WolfekAdminPanel from './WolfekAdminPanel'
import type { WolfekAdminPageProps } from '@/types/wolfekAdminTypes'

export default async function WolfekAdminContent({ searchParams }: WolfekAdminPageProps) {
  const { userId } = await requireAdmin()
  const params = await searchParams
  const defaults = getDefaultWolfekAdminFilters()
  const candidate = Object.fromEntries(Object.keys(defaults).map((key) => [key, params[key] ?? defaults[key as keyof typeof defaults]]))
  const parsed = WolfekAdminFiltersSchema.safeParse(candidate)
  if (!parsed.success) return <p role="alert" className="text-red-700">Nieprawidłowe filtry. Otwórz /admin/wolfek bez parametrów.</p>
  try {
    const report = await getWolfekAdminReport(parsed.data)
    return <WolfekAdminPanel userId={userId} initialFilters={parsed.data} initialReport={report} />
  } catch {
    return <section className="space-y-3"><h1 className="text-2xl font-bold">Wolfek</h1>
      <p role="alert" className="text-red-700">Nie można pobrać raportów. Sprawdź połączenie z bazą i migrację Wolfek metrics.</p>
    </section>
  }
}
