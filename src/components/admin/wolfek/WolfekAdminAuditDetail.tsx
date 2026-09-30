'use client'

import { useQuery } from '@tanstack/react-query'
import { getAdminWolfekAuditDetailAction } from '@/actions/wolfek-admin'
import { WOLFEK_ADMIN_STALE_TIME } from '@/constants/wolfekAdmin'
import { formatWolfekAdminDate } from '@/helpers/formatWolfekAdminDate'

export default function WolfekAdminAuditDetail({ id, userId }: { id: string; userId: string }) {
  const query = useQuery({ queryKey: ['wolfek-admin-detail', userId, id],
    queryFn: () => getAdminWolfekAuditDetailAction(id), staleTime: WOLFEK_ADMIN_STALE_TIME, retry: false })
  if (query.isPending) return <p role="status" className="p-4 text-sm">Ładowanie pełnego logu…</p>
  if (query.isError) return <p role="alert" className="p-4 text-sm text-red-700">Nie można pobrać logu. Mógł wygasnąć.</p>
  const log = query.data
  return <div className="grid gap-4 bg-zinc-50 p-5">
    <dl className="grid gap-2 text-xs text-zinc-600 sm:grid-cols-2">
      <div><dt className="font-semibold">Użytkownik / sesja</dt><dd className="break-all">{log.userId ?? 'Anonimowy'} / {log.sessionId ?? '—'}</dd></div>
      <div><dt className="font-semibold">Model / polityka</dt><dd>{log.model} / {log.policyVersion}</dd></div>
      <div><dt className="font-semibold">Czas / HTTP</dt><dd>{log.latencyMs} ms / {log.httpStatus ?? '—'}</dd></div>
      <div><dt className="font-semibold">Wygaśnięcie</dt><dd>{formatWolfekAdminDate(log.expiresAt)}</dd></div>
    </dl>
    {(log.errorName || log.errorMessage) && <p className="break-words text-sm text-red-700">{log.errorName}: {log.errorMessage}</p>}
    <div className="grid gap-4 lg:grid-cols-2">
      <div><h3 className="mb-2 text-sm font-semibold">Pełne zapytanie</h3>
        <pre className="max-h-96 overflow-auto rounded-xl bg-zinc-900 p-4 text-xs text-zinc-100">{JSON.stringify(log.requestPayload, null, 2)}</pre></div>
      <div><h3 className="mb-2 text-sm font-semibold">Pełna odpowiedź</h3>
        <pre className="max-h-96 overflow-auto rounded-xl bg-zinc-900 p-4 text-xs text-zinc-100">{JSON.stringify(log.responsePayload, null, 2)}</pre></div>
    </div>
    <details><summary className="cursor-pointer text-sm font-semibold">Oryginalne body odpowiedzi</summary>
      <pre className="mt-2 max-h-96 overflow-auto rounded-xl bg-zinc-900 p-4 text-xs text-zinc-100">{log.responseText ?? 'Brak odpowiedzi HTTP'}</pre>
    </details>
  </div>
}
