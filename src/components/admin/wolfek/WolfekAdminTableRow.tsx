'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { formatWolfekAdminDate } from '@/helpers/formatWolfekAdminDate'
import { getWolfekTopicLabel } from '@/helpers/getWolfekTopicLabel'
import WolfekAdminAuditDetail from './WolfekAdminAuditDetail'
import type { WolfekAdminRow } from '@/types/wolfekAdminTypes'

export default function WolfekAdminTableRow({ row, userId }: { row: WolfekAdminRow; userId: string }) {
  const [open, setOpen] = useState(false)
  return <>
    <tr className="border-b border-zinc-100 align-top">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">{formatWolfekAdminDate(row.createdAt)}<br />{row.route}</td>
      <td className="min-w-64 max-w-md px-4 py-3"><p className="break-words text-sm">{row.question}</p>
        <p className="mt-1 text-xs text-zinc-500">{getWolfekTopicLabel(row.source, row.topic)}</p></td>
      <td className="px-4 py-3 text-xs"><span className="rounded-full bg-zinc-100 px-2 py-1">{row.status}</span>
        {row.needsReview && <p className="mt-2 text-amber-700">Do przeglądu</p>}</td>
      <td className="px-4 py-3 text-xs">{row.confidence === null ? '—' : `${Math.round(row.confidence * 100)}%`}</td>
      <td className="px-4 py-3 text-xs">{row.latencyMs === null ? '—' : `${row.latencyMs} ms`}</td>
      <td className="px-4 py-3 text-xs">{row.inputTokens === null || row.outputTokens === null ? 'Nieznane' :
        (row.inputTokens + row.outputTokens).toLocaleString('pl-PL')}</td>
      <td className="px-4 py-3 text-xs">{row.model || (row.kind === 'topic_click' ? 'Przycisk' : 'Pytanie')}</td>
      <td className="px-4 py-3">{row.kind === 'provider' && <Button variant="ghost" size="sm"
        aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Zwiń' : 'Pełny log'}</Button>}</td>
    </tr>
    {open && <tr><td colSpan={8}><WolfekAdminAuditDetail id={row.id} userId={userId} /></td></tr>}
  </>
}
