'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import {
  getDiagnozaFillDataAction,
  markDiagnozaCompletedAction,
} from '@/actions/diagnozy'
import WypelnijCasePanel from '@/components/diagnozy/wypelnij/WypelnijCasePanel'
import PrzewodnikFormRow from '@/components/diagnozy/wypelnij/PrzewodnikFormRow'
import SingleSelectRow from '@/components/diagnozy/wypelnij/SingleSelectRow'
import AddFromListRow from '@/components/diagnozy/wypelnij/AddFromListRow'
import WypelnijComplete from '@/components/diagnozy/wypelnij/WypelnijComplete'
import type { Diagnoza, DiagnozaFillData, DiagnozaFormulation } from '@/types/diagnozyTypes'

export default function WypelnijRunner({
  diagnoza,
  formulations,
  alreadyCompleted,
}: {
  diagnoza: Diagnoza
  formulations: DiagnozaFormulation[]
  alreadyCompleted: boolean
}) {
  const router = useRouter()
  const [chosenSlug, setChosenSlug] = useState<string | null>(null)
  const [fillDataCache, setFillDataCache] = useState<Record<string, DiagnozaFillData>>({
    [diagnoza.slug]: {
      celeOpieki: diagnoza.celeOpieki,
      interwencje: diagnoza.interwencje,
      oczekiwaneWyniki: diagnoza.oczekiwaneWyniki,
    },
  })
  const [loadingData, setLoadingData] = useState(false)
  const [cele, setCele] = useState<string[]>([])
  const [interwencje, setInterwencje] = useState<string[]>([])
  const [ocena, setOcena] = useState<string | null>(null)
  const [completed, setCompleted] = useState(alreadyCompleted)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fillData = chosenSlug ? (fillDataCache[chosenSlug] ?? null) : null

  const handleDiagnozaChange = async (slug: string) => {
    setChosenSlug(slug)
    setCele([])
    setInterwencje([])
    setOcena(null)
    setError(null)
    if (!fillDataCache[slug]) {
      setLoadingData(true)
      const result = await getDiagnozaFillDataAction(slug)
      setLoadingData(false)
      if (result.status === 'SUCCESS') {
        setFillDataCache((prev) => ({ ...prev, [slug]: result.data }))
      } else {
        setError(result.message)
        setChosenSlug(null)
      }
    }
  }

  const handleComplete = async () => {
    setSubmitting(true)
    setError(null)
    const result = await markDiagnozaCompletedAction(diagnoza.slug)
    setSubmitting(false)
    if (result.status === 'SUCCESS') {
      setCompleted(true)
      router.refresh()
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <WypelnijCasePanel opisPrzypadku={diagnoza.opisPrzypadku} />
      </div>
      <p className="text-sm text-zinc-600 mb-4">
        Wypełnij przewodnik procesu pielęgnowania: postaw diagnozę, a następnie
        uzupełnij kolejne pola, dodając pozycje z list.
      </p>

      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
        <PrzewodnikFormRow label="Diagnoza pielęgniarska" active first>
          <SingleSelectRow
            options={formulations.map((f) => ({ value: f.slug, label: f.text }))}
            value={chosenSlug}
            onChange={handleDiagnozaChange}
            placeholder="— wybierz diagnozę pielęgniarską —"
            ariaLabel="Diagnoza pielęgniarska"
          />
          {loadingData && (
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-400">
              <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
              Wczytywanie danych diagnozy…
            </p>
          )}
        </PrzewodnikFormRow>

        <PrzewodnikFormRow label="Cel" active={!!fillData}>
          <AddFromListRow
            options={(fillData?.celeOpieki ?? []).map((cel) => ({ text: cel }))}
            added={cele}
            onAdd={(text) => setCele((prev) => [...prev, text])}
            onRemove={(text) => setCele((prev) => prev.filter((item) => item !== text))}
            placeholder="— wybierz cel opieki —"
            ariaLabel="Cel opieki"
          />
        </PrzewodnikFormRow>

        <PrzewodnikFormRow label="Planowane interwencje" active={cele.length > 0}>
          <AddFromListRow
            options={(fillData?.interwencje ?? []).map((item) => ({
              text: item.interwencja,
              detail: item.uzasadnienie,
            }))}
            added={interwencje}
            onAdd={(text) => setInterwencje((prev) => [...prev, text])}
            onRemove={(text) =>
              setInterwencje((prev) => prev.filter((item) => item !== text))
            }
            placeholder="— wybierz interwencję pielęgniarską —"
            ariaLabel="Planowana interwencja"
          />
        </PrzewodnikFormRow>

        <PrzewodnikFormRow label="Zrealizowane interwencje" active={interwencje.length > 0}>
          <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-600">
            {interwencje.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PrzewodnikFormRow>

        <PrzewodnikFormRow label="Ocena" active={interwencje.length > 0}>
          <SingleSelectRow
            options={fillData ? [{ value: fillData.oczekiwaneWyniki, label: fillData.oczekiwaneWyniki }] : []}
            value={ocena}
            onChange={setOcena}
            placeholder="— wybierz oczekiwany wynik opieki —"
            ariaLabel="Ocena / oczekiwany wynik opieki"
          />
        </PrzewodnikFormRow>
      </div>

      <WypelnijComplete
        completed={completed}
        submitting={submitting}
        disabled={!chosenSlug || cele.length === 0 || interwencje.length === 0 || !ocena}
        error={error}
        onComplete={handleComplete}
      />
    </div>
  )
}
