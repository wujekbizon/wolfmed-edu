import Card from '@/components/ui/Card'
import type { WolfekAdminRoute } from '@/types/wolfekAdminTypes'

export default function WolfekAdminRoutes({ routes }: { routes: WolfekAdminRoute[] }) {
  return <Card className="p-5"><h2 className="mb-4 font-semibold">Miejsca użycia</h2>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{routes.map((route) => <div key={route.route}
      className="rounded-xl bg-zinc-50 p-4">
      <p className="text-sm font-semibold">{route.route}</p>
      <p className="mt-2 text-xs text-zinc-500">{route.questions.toLocaleString('pl-PL')} pytań · {route.clicks.toLocaleString('pl-PL')} kliknięć</p>
      <p className="mt-1 text-xs text-violet-700">{route.providerCalls.toLocaleString('pl-PL')} płatnych wywołań</p>
    </div>)}</div>
    {!routes.length && <p className="text-sm text-zinc-500">Brak aktywności w wybranym okresie.</p>}
  </Card>
}
