'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Card from '@/components/ui/Card'
import { getWolfekTopicLabel } from '@/helpers/getWolfekTopicLabel'
import type { WolfekAdminTopic } from '@/types/wolfekAdminTypes'

export default function WolfekAdminTopics({ topics }: { topics: WolfekAdminTopic[] }) {
  const data = topics.map((topic) => ({ ...topic, label: `${getWolfekTopicLabel(topic.source, topic.topic)} (${topic.source})` }))
  return <Card className="min-w-0 p-5">
    <h2 className="mb-2 font-semibold">O co użytkownicy pytają?</h2>
    <p className="mb-4 text-xs text-zinc-500">Tematy według routingu Jev i wybranych przycisków. Bez dodatkowej analizy AI.</p>
    {!topics.length ? <p className="py-8 text-sm text-zinc-500">Tematy pojawią się po pierwszych interakcjach.</p>
      : <div className="h-80"><ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ right: 12 }}>
          <XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="label" width={180} tick={{ fontSize: 10 }} />
          <Tooltip /><Legend /><Bar dataKey="questions" name="Pytania" stackId="activity" fill="#8b5cf6" />
          <Bar dataKey="clicks" name="Kliknięcia" stackId="activity" fill="#f43f5e" />
        </BarChart>
      </ResponsiveContainer></div>}
  </Card>
}
