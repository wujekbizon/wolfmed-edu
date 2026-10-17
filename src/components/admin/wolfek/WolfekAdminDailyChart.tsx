'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Card from '@/components/ui/Card'
import { fillWolfekDailyChart } from '@/helpers/fillWolfekDailyChart'
import type { WolfekAdminDaily, WolfekAdminFilters } from '@/types/wolfekAdminTypes'

export default function WolfekAdminDailyChart({ rows, filters }: { rows: WolfekAdminDaily[]; filters: WolfekAdminFilters }) {
  const data = fillWolfekDailyChart(rows, filters.from, filters.to)
  const series = filters.view === 'insights' ? [
    { key: 'questions', name: 'Pytania', color: '#8b5cf6' }, { key: 'clicks', name: 'Tematy', color: '#f43f5e' },
    { key: 'cacheHits', name: 'Cache', color: '#14b8a6' },
  ] : filters.view === 'usage' ? [
    { key: 'inputTokens', name: 'Tokeny wejściowe', color: '#8b5cf6' },
    { key: 'outputTokens', name: 'Tokeny wyjściowe', color: '#f43f5e' },
  ] : [{ key: 'providerCalls', name: 'Wywołania', color: '#8b5cf6' }, { key: 'errors', name: 'Błędy', color: '#f43f5e' }]
  return <Card className="min-w-0 p-5">
    <h2 className="mb-4 font-semibold">{filters.view === 'usage' ? 'Tokeny w czasie' : 'Aktywność w czasie'}</h2>
    {!rows.length && <p className="mb-3 text-sm text-zinc-500">Brak danych w tym okresie.</p>}
    <div className="h-64 w-full min-w-0"><ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="day" tickFormatter={(day: string) => day.slice(5)} tick={{ fontSize: 11 }} minTickGap={30} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={55} />
        <Tooltip /><Legend />
        {series.map((line) => <Line key={line.key} dataKey={line.key} name={line.name} stroke={line.color}
          strokeWidth={2} dot={false} isAnimationActive={false} />)}
      </LineChart>
    </ResponsiveContainer></div>
  </Card>
}
