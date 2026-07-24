import type { DiagnozaInterwencja } from '@/types/diagnozyTypes'

export default function InterwencjeTable({
  interwencje,
}: {
  interwencje: DiagnozaInterwencja[]
}) {
  return (
    <div>
      {/* Desktop: two-column table mirroring the book layout */}
      <div className="hidden md:block border border-zinc-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-600 uppercase tracking-wide">
          <div className="px-4 py-2.5">Interwencja</div>
          <div className="px-4 py-2.5 border-l border-zinc-200">Uzasadnienie</div>
        </div>
        {interwencje.map((item, index) => (
          <div
            key={item.interwencja}
            className={`grid grid-cols-2 text-sm text-zinc-600 ${
              index > 0 ? 'border-t border-zinc-100' : ''
            }`}
          >
            <div className="px-4 py-3">{item.interwencja}</div>
            <div className="px-4 py-3 border-l border-zinc-100 text-zinc-500">
              {item.uzasadnienie || <span className="text-zinc-300">—</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-3">
        {interwencje.map((item) => (
          <div
            key={item.interwencja}
            className="border border-zinc-200 rounded-xl p-3 bg-white"
          >
            <p className="text-sm text-zinc-700 font-medium mb-2">{item.interwencja}</p>
            {item.uzasadnienie && (
              <p className="text-xs text-zinc-500">
                <span className="font-semibold uppercase tracking-wide">Uzasadnienie: </span>
                {item.uzasadnienie}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
