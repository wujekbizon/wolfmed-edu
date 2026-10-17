import Card from '@/components/ui/Card'
import type { WolfekAdminLifetime, WolfekAdminModel } from '@/types/wolfekAdminTypes'

export default function WolfekAdminUsage({ lifetime, models }: { lifetime: WolfekAdminLifetime; models: WolfekAdminModel[] }) {
  const number = new Intl.NumberFormat('pl-PL')
  return <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
    <Card className="p-5"><h2 className="font-semibold">Łączne zapisane użycie</h2>
      <p className="mt-4 text-3xl font-bold">{number.format(lifetime.inputTokens + lifetime.outputTokens)}</p>
      <p className="text-sm text-zinc-500">tokenów · {number.format(lifetime.calls)} wywołań</p>
      <p className="mt-4 text-xs text-zinc-500">Od {lifetime.providerSince ?? 'pierwszego zarejestrowanego wywołania'}.
        Sumy przetrwają usunięcie pełnych logów. Nie obejmują niezapisanych wcześniejszych wywołań.</p>
      <p className="mt-2 text-xs text-amber-700">{number.format(lifetime.missingUsage)} wywołań bez pełnej informacji o tokenach.
        To użycie z naszej aplikacji, nie raport rozliczeniowy całego konta TypeSafe.</p>
    </Card>
    <Card className="overflow-x-auto p-5"><h2 className="mb-4 font-semibold">Modele w wybranym okresie</h2>
      <table className="w-full text-left text-sm"><thead><tr>{['Model', 'Wywołania', 'Input', 'Output', 'Brak usage'].map((label) =>
        <th key={label} className="pb-3 pr-3 text-xs font-medium text-zinc-500">{label}</th>)}</tr></thead>
        <tbody>{models.map((row) => <tr key={row.model} className="border-t border-zinc-100">
          <td className="py-3 pr-3">{row.model}</td><td>{number.format(row.calls)}</td>
          <td>{number.format(row.inputTokens)}</td><td>{number.format(row.outputTokens)}</td><td>{row.missingUsage}</td>
        </tr>)}</tbody></table>
      {!models.length && <p className="py-6 text-sm text-zinc-500">Brak zapisanych wywołań.</p>}
    </Card>
  </div>
}
