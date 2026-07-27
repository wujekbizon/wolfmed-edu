'use client'

import { LoaderCircle } from 'lucide-react'
import PrzewodnikFormRow from '@/components/diagnozy/wypelnij/PrzewodnikFormRow'
import SingleSelectRow from '@/components/diagnozy/wypelnij/SingleSelectRow'
import AddFromListRow from '@/components/diagnozy/wypelnij/AddFromListRow'
import type { WypelnijForm } from '@/hooks/useWypelnijForm'
import type { DiagnozaFormulation } from '@/types/diagnozyTypes'

export default function WypelnijGuide({
  form,
  formulations,
}: {
  form: WypelnijForm
  formulations: DiagnozaFormulation[]
}) {
  const { fillData } = form

  return (
    <div className="border border-zinc-200 rounded-xl bg-white">
      <PrzewodnikFormRow label="Diagnoza pielęgniarska" active first>
        <SingleSelectRow
          options={formulations.map((f) => ({ value: f.slug, label: f.text }))}
          value={form.chosenSlug}
          onChange={form.chooseDiagnoza}
          placeholder="— wybierz diagnozę pielęgniarską —"
          ariaLabel="Diagnoza pielęgniarska"
        />
        {form.loadingData && (
          <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-400">
            <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
            Wczytywanie danych diagnozy…
          </p>
        )}
      </PrzewodnikFormRow>

      <PrzewodnikFormRow label="Cel" active={!!fillData}>
        <AddFromListRow
          options={(fillData?.celeOpieki ?? []).map((cel) => ({ text: cel }))}
          added={form.cele}
          onAdd={form.addCel}
          onRemove={form.removeCel}
          placeholder="— wybierz cel opieki —"
          ariaLabel="Cel opieki"
        />
      </PrzewodnikFormRow>

      <PrzewodnikFormRow label="Planowane interwencje" active={form.cele.length > 0}>
        <AddFromListRow
          options={(fillData?.interwencje ?? []).map((item) => ({
            text: item.interwencja,
            detail: item.uzasadnienie,
          }))}
          added={form.interwencje}
          onAdd={form.addInterwencja}
          onRemove={form.removeInterwencja}
          placeholder="— wybierz interwencję pielęgniarską —"
          ariaLabel="Planowana interwencja"
        />
      </PrzewodnikFormRow>

      <PrzewodnikFormRow
        label="Zrealizowane interwencje"
        active={form.interwencje.length > 0}
      >
        <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-600">
          {form.interwencje.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </PrzewodnikFormRow>

      <PrzewodnikFormRow label="Ocena" active={form.interwencje.length > 0} last>
        <SingleSelectRow
          options={
            fillData
              ? [{ value: fillData.oczekiwaneWyniki, label: fillData.oczekiwaneWyniki }]
              : []
          }
          value={form.ocena}
          onChange={form.setOcena}
          placeholder="— wybierz oczekiwany wynik opieki —"
          ariaLabel="Ocena / oczekiwany wynik opieki"
        />
      </PrzewodnikFormRow>
    </div>
  )
}
