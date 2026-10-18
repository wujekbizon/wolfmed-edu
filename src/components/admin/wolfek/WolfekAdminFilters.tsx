import DateInput from '@/components/ui/DateInput'
import DropdownSelect from '@/components/ui/DropdownSelect'
import BrowseSearchInput from '@/components/ui/BrowseSearchInput'
import FieldError from '@/components/FieldError'
import FormError from '@/components/FormError'
import type { FormState } from '@/types/actionTypes'
import { WOLFEK_SOURCE_OPTIONS, WOLFEK_STATUS_OPTIONS } from '@/constants/wolfekAdmin'
import type { WolfekAdminFilters as Filters } from '@/types/wolfekAdminTypes'

export default function WolfekAdminFilters({ filters, onChange, formState }: {
  filters: Filters; onChange: (patch: Partial<Filters>) => void; formState: FormState
}) {
  return <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
    <div><DateInput id="wolfek-from" label="Od" value={filters.from} onChange={(from) => onChange({ from })} />
      <FieldError name="from" formState={formState} /></div>
    <div><DateInput id="wolfek-to" label="Do" value={filters.to} onChange={(to) => onChange({ to })} />
      <FieldError name="to" formState={formState} /></div>
    <div className="self-end"><DropdownSelect options={WOLFEK_SOURCE_OPTIONS} value={filters.source}
      ariaLabel="Miejsce użycia Wolfka" onSelect={(source) => onChange({ source: source as Filters['source'] })} /></div>
    {(filters.view === 'audit' || filters.view === 'errors') && <div className="self-end">
      <DropdownSelect options={WOLFEK_STATUS_OPTIONS} value={filters.status} ariaLabel="Status wywołania"
        onSelect={(status) => onChange({ status: status as Filters['status'] })} />
    </div>}
    {filters.view !== 'usage' && <BrowseSearchInput value={filters.search} onChange={(search) => onChange({ search })}
      ariaLabel="Szukaj pytań lub błędów" placeholder="Szukaj pytań, tematów lub błędów…" className="sm:col-span-2 lg:col-span-4" />}
    <p className="text-xs text-zinc-500 sm:col-span-2 lg:col-span-4">Daty: Europe/Warsaw. Wyszukiwanie i status filtrują listę; wykresy dotyczą okresu i miejsca.</p>
    <FormError formState={{ ...formState, fieldErrors: { ...formState.fieldErrors, from: undefined, to: undefined } }} />
  </div>
}
