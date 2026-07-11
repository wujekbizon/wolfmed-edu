'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ProgressLineChartProps {
  data: Array<{
    date: string
    avgScore: string
    testsCount: number
    studyMinutes?: number
  }>
}

export default function ProgressLineChart({ data }: ProgressLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Postępy w czasie</h3>
        <div className="flex items-center justify-center h-64 text-zinc-500">
          Brak danych do wyświetlenia
        </div>
      </div>
    )
  }

  const hasEffort = data.some((item) => (item.studyMinutes ?? 0) > 0)

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
    score: parseFloat(item.avgScore),
    minutes: item.studyMinutes ?? 0,
  }))

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Postępy w czasie</h3>
        <p className="text-sm text-zinc-600">
          {hasEffort
            ? 'Twój średni wynik i czas nauki w ostatnich 30 dniach'
            : 'Twój średni wynik w ostatnich 30 dniach'}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.5} />
          <XAxis
            dataKey="date"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            yAxisId="score"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          {hasEffort && (
            <YAxis
              yAxisId="minutes"
              orientation="right"
              stroke="#c084fc"
              fontSize={12}
              tickLine={false}
              allowDecimals={false}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#18181b', fontWeight: 600 }}
            formatter={(value, name) => {
              const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
              if (name === 'Czas nauki') return [`${Math.round(numericValue)} min`, name]
              return [`${numericValue.toFixed(2)}%`, 'Wynik']
            }}
          />
          {hasEffort && <Legend />}
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="score"
            name="Wynik"
            stroke="#ff9898"
            strokeWidth={3}
            dot={{ fill: '#ff9898', r: 4 }}
            activeDot={{ r: 6, fill: '#ff5b5b' }}
          />
          {hasEffort && (
            <Line
              yAxisId="minutes"
              type="monotone"
              dataKey="minutes"
              name="Czas nauki"
              stroke="#c084fc"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ fill: '#c084fc', r: 3 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
