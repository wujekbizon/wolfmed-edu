'use client'

import { Bot, Download, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useWolfekAdminReport } from '@/hooks/useWolfekAdminReport'
import { useWolfekAdminExport } from '@/hooks/useWolfekAdminExport'
import { WOLFEK_ADMIN_VIEWS, WOLFEK_EXPORT_LIMIT } from '@/constants/wolfekAdmin'
import WolfekAdminSkeleton from '@/components/skeletons/WolfekAdminSkeleton'
import WolfekAdminFilters from './WolfekAdminFilters'
import WolfekAdminStats from './WolfekAdminStats'
import WolfekAdminDailyChart from './WolfekAdminDailyChart'
import WolfekAdminTopics from './WolfekAdminTopics'
import WolfekAdminUsage from './WolfekAdminUsage'
import WolfekAdminRoutes from './WolfekAdminRoutes'
import WolfekAdminTable from './WolfekAdminTable'
import type { WolfekAdminFilters as Filters, WolfekAdminReport } from '@/types/wolfekAdminTypes'

export default function WolfekAdminPanel({ userId, initialFilters, initialReport }: {
  userId: string; initialFilters: Filters; initialReport: WolfekAdminReport
}) {
  const { filters, effective, query, change, setPage } = useWolfekAdminReport(userId, initialFilters, initialReport)
  const exports = useWolfekAdminExport(effective)
  const report = query.data
  const loading = query.isFetching || filters.search !== effective.search
  const view = WOLFEK_ADMIN_VIEWS.find((item) => item.value === filters.view)!
  return <section className="space-y-5 text-zinc-900">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="flex items-center gap-2 text-2xl font-bold"><Bot className="text-rose-500" />Wolfek</h1>
        <p className="mt-1 text-sm text-zinc-500">Pytania, decyzje Jev i tokeny w jednym miejscu.</p></div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" disabled={loading} onClick={() => void query.refetch()}><RefreshCw size={15} />Odśwież</Button>
        {(['csv', 'json'] as const).map((format) => <Button key={format} variant="secondary" size="sm"
          disabled={loading || query.isError || exports.pending} onClick={() => void exports.download(format)}>
          <Download size={15} />{format.toUpperCase()}</Button>)}
      </div>
    </header>
    <nav className="flex flex-wrap gap-2 rounded-2xl bg-zinc-100 p-2" aria-label="Widoki raportów Wolfka">
      {WOLFEK_ADMIN_VIEWS.map((item) => <Button key={item.value} size="sm"
        variant={filters.view === item.value ? 'secondary' : 'ghost'} aria-pressed={filters.view === item.value}
        onClick={() => change({ view: item.value, search: '', status: 'all' })}>{item.label}</Button>)}
    </nav>
    <WolfekAdminFilters filters={filters} onChange={change} />
    <div><h2 className="text-lg font-semibold">{view.label}</h2><p className="text-sm text-zinc-500">{view.description}</p></div>
    {(query.isError || exports.error) && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
      {exports.error || 'Nie udało się pobrać danych. Sprawdź daty (maksymalnie 366 dni) i odśwież raport.'}</p>}
    {(!report || query.isPlaceholderData) && !query.isError ? <WolfekAdminSkeleton /> : report && !query.isError &&
      <div className="space-y-5" aria-busy={loading}>
        <WolfekAdminStats summary={report.summary} view={filters.view} />
        {filters.view === 'insights' ? <div className="grid gap-4 xl:grid-cols-2">
          <WolfekAdminDailyChart rows={report.daily} filters={effective} /><WolfekAdminTopics topics={report.topics} />
        </div> : <WolfekAdminDailyChart rows={report.daily} filters={effective} />}
        {filters.view === 'insights' && <WolfekAdminRoutes routes={report.routes} />}
        {filters.view === 'usage' ? <WolfekAdminUsage lifetime={report.lifetime} models={report.models} /> :
          <WolfekAdminTable rows={report.rows} total={report.totalRows} page={filters.page}
            userId={userId} pending={loading} onPage={setPage} />}
        {filters.view === 'insights' && <p className="text-xs text-zinc-500">Pomiar interakcji od {report.lifetime.activitySince ?? 'pierwszego użycia po migracji'}.
          Pierwszy przycisk pobiera jeden pakiet Jev. Kolejne używają wyników z tej wizyty. Wpisane pytania mają osobne wywołania.</p>}
      </div>}
    <p className="text-xs text-zinc-500">Eksport obejmuje wybrany widok i filtry, do {WOLFEK_EXPORT_LIMIT} pełnych wierszy.
      Pliki mogą zawierać treść pytań i dane audytowe użytkowników.</p>
  </section>
}
