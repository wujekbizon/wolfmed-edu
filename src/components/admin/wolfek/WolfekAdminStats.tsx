import { Activity, MessageCircle, MousePointer2, Database, AlertTriangle, Coins } from 'lucide-react'
import AdminStatCard from '@/components/admin/AdminStatCard'
import type { WolfekAdminSummary, WolfekAdminView } from '@/types/wolfekAdminTypes'

export default function WolfekAdminStats({ summary, view }: { summary: WolfekAdminSummary; view: WolfekAdminView }) {
  const number = new Intl.NumberFormat('pl-PL')
  const errorRate = summary.providerCalls ? (summary.errors / summary.providerCalls * 100).toFixed(1) : '0.0'
  const stats = view === 'insights' ? [
    { label: 'Własne pytania', value: number.format(summary.questions), icon: <MessageCircle />, footer: 'Także pytania z cache' },
    { label: 'Kliknięcia tematów', value: number.format(summary.clicks), icon: <MousePointer2 />, footer: 'Bez wywołań Jev' },
    { label: 'Odpowiedzi z cache', value: number.format(summary.cacheHits), icon: <Database />, footer: 'Powtórzone pytania użytkowników' },
    { label: 'Do przeglądu', value: number.format(summary.reviews), icon: <AlertTriangle />, footer: 'Brak rozpoznania lub niska pewność' },
  ] : [
    { label: 'Wywołania Jev', value: number.format(summary.providerCalls), icon: <Activity />, footer: 'Rzeczywiste zapytania do TypeSafe' },
    { label: 'Tokeny wejściowe', value: number.format(summary.inputTokens), icon: <Coins />, footer: 'Z pól usage w odpowiedziach' },
    { label: 'Tokeny wyjściowe', value: number.format(summary.outputTokens), icon: <Coins />, footer: `${summary.missingUsage} wywołań bez pełnego usage` },
    { label: 'Błędy', value: number.format(summary.errors), icon: <AlertTriangle />, footer: `${errorRate}% wywołań · średnio ${Math.round(summary.avgLatency)} ms` },
  ]
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map((item) => <AdminStatCard key={item.label}
    {...item} accent="bg-rose-50 text-rose-600" />)}</div>
}
