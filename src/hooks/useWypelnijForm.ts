import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  getDiagnozaFillDataAction,
  markDiagnozaCompletedAction,
} from '@/actions/diagnozy'
import { showToast } from '@/hooks/useToastMessage'
import type { Diagnoza, DiagnozaFillData } from '@/types/diagnozyTypes'

export function useWypelnijForm(diagnoza: Diagnoza, alreadyCompleted: boolean) {
  const router = useRouter()
  const [chosenSlug, setChosenSlug] = useState<string | null>(null)
  const [fillDataCache, setFillDataCache] = useState<Record<string, DiagnozaFillData>>({
    [diagnoza.slug]: {
      celeOpieki: diagnoza.celeOpieki,
      interwencje: diagnoza.interwencje,
      oczekiwaneWyniki: diagnoza.oczekiwaneWyniki,
    },
  })
  const [cele, setCele] = useState<string[]>([])
  const [interwencje, setInterwencje] = useState<string[]>([])
  const [ocena, setOcena] = useState<string | null>(null)
  const [completed, setCompleted] = useState(alreadyCompleted)
  const [loadingData, startLoadingData] = useTransition()
  const [submitting, startSubmitting] = useTransition()

  const fillData = chosenSlug ? (fillDataCache[chosenSlug] ?? null) : null

  const resetAnswers = () => {
    setCele([])
    setInterwencje([])
    setOcena(null)
  }

  const practiceAgain = () => {
    setChosenSlug(null)
    resetAnswers()
  }

  const chooseDiagnoza = (slug: string) => {
    setChosenSlug(slug)
    resetAnswers()
    if (fillDataCache[slug]) return

    startLoadingData(async () => {
      const result = await getDiagnozaFillDataAction(slug)
      if (result.status !== 'SUCCESS') {
        showToast('ERROR', result.message)
        setChosenSlug(null)
        return
      }
      setFillDataCache((prev) => ({ ...prev, [slug]: result.data }))
    })
  }

  const complete = () =>
    startSubmitting(async () => {
      const result = await markDiagnozaCompletedAction(diagnoza.slug)
      if (result.status !== 'SUCCESS') {
        showToast('ERROR', result.message)
        return
      }
      setCompleted(true)
      router.refresh()
    })

  return {
    chosenSlug,
    fillData,
    cele,
    interwencje,
    ocena,
    completed,
    loadingData,
    submitting,
    setOcena,
    addCel: (text: string) => setCele((prev) => [...prev, text]),
    removeCel: (text: string) => setCele((prev) => prev.filter((item) => item !== text)),
    addInterwencja: (text: string) => setInterwencje((prev) => [...prev, text]),
    removeInterwencja: (text: string) =>
      setInterwencje((prev) => prev.filter((item) => item !== text)),
    chooseDiagnoza,
    complete,
    practiceAgain,
  }
}

export type WypelnijForm = ReturnType<typeof useWypelnijForm>
