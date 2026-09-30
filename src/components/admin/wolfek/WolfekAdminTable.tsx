import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { WOLFEK_ADMIN_PAGE_SIZE } from '@/constants/wolfekAdmin'
import WolfekAdminTableRow from './WolfekAdminTableRow'
import type { WolfekAdminRow } from '@/types/wolfekAdminTypes'

export default function WolfekAdminTable({ rows, total, page, userId, pending, onPage }: {
  rows: WolfekAdminRow[]; total: number; page: number; userId: string; pending: boolean; onPage: (page: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / WOLFEK_ADMIN_PAGE_SIZE))
  return <Card className="overflow-hidden">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 p-4">
      <h2 className="font-semibold">Lista ({total.toLocaleString('pl-PL')})</h2>
      <span className="text-xs text-zinc-500">Pełne treści dostępne do 30 dni</span>
    </div>
    {!rows.length ? <p className="p-8 text-center text-sm text-zinc-500">Brak wyników dla tych filtrów.</p> :
      <div className="overflow-x-auto"><table className="w-full text-left">
        <thead className="bg-zinc-50 text-xs text-zinc-600"><tr>
          {['Data / miejsce', 'Pytanie / temat', 'Status', 'Pewność', 'Czas', 'Tokeny', 'Model / typ', 'Szczegóły'].map((label) =>
            <th key={label} className="px-4 py-3 font-medium">{label}</th>)}
        </tr></thead>
        <tbody>{rows.map((row) => <WolfekAdminTableRow key={row.id} row={row} userId={userId} />)}</tbody>
      </table></div>}
    <div className="flex items-center justify-between border-t border-zinc-100 p-4">
      <Button variant="secondary" size="sm" disabled={pending || page <= 1} onClick={() => onPage(page - 1)}>Poprzednia</Button>
      <span className="text-xs text-zinc-500">Strona {page} z {pages}</span>
      <Button variant="secondary" size="sm" disabled={pending || page >= pages} onClick={() => onPage(page + 1)}>Następna</Button>
    </div>
  </Card>
}
