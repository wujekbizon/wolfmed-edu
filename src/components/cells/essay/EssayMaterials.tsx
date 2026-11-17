'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, FolderOpen, Upload, X } from 'lucide-react'
import { getEssayMaterialsAction } from '@/actions/essay-resources'
import { ESSAY_MATERIAL_QUERY, ESSAY_MATERIAL_STALE_TIME } from '@/constants/essay'
import { useEssayResources } from '@/context/EssayResourcesContext'
import { useMaterialModalStore } from '@/store/useMaterialModalStore'
import Button from '@/components/ui/Button'
import EssayMaterialRow from './EssayMaterialRow'
import type { EssayMaterialsProps } from '@/types/essayUiTypes'

export default function EssayMaterials({ cellId, brief, onChange }: EssayMaterialsProps) {
  const { userId, materials } = useEssayResources()
  const [open, setOpen] = useState(false)
  const openUpload = useMaterialModalStore((state) => state.openEssayUploadModal)
  const query = useQuery({
    queryKey: [ESSAY_MATERIAL_QUERY, userId], queryFn: getEssayMaterialsAction,
    initialData: materials, staleTime: ESSAY_MATERIAL_STALE_TIME,
    refetchInterval: (current) => current.state.data?.some((item) => !item.ready && item.indexStatus === 'pending') ? 4000 : false,
  })
  const toggle = (id: string) => onChange({ ...brief, materialIds: brief.materialIds.includes(id)
    ? brief.materialIds.filter((value) => value !== id) : [...brief.materialIds, id] })
  return (
    <section className="space-y-3 border-t border-zinc-200 pt-4" aria-label="Materiały do pracy">
      <h3 className="text-sm font-medium text-zinc-800">Materiały do pracy</h3>
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500"><BookOpen className="size-4" />Baza wiedzy Wolfmed<span className="ml-auto text-emerald-700">Uwzględniona</span></div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setOpen(!open)} aria-expanded={open}><FolderOpen className="size-4" />Wybierz z materiałów</Button>
        <Button variant="secondary" size="sm" onClick={() => openUpload(cellId)}><Upload className="size-4" />Dodaj PDF / TXT</Button>
      </div>
      {query.isError && <p role="alert" className="text-sm text-red-600">Nie udało się pobrać materiałów. <Button variant="ghost" size="sm" onClick={() => void query.refetch()}>Ponów</Button></p>}
      {open && <div className="space-y-2">
        {!query.data.length && <p className="text-sm text-zinc-500">Dodaj pierwszy plik PDF lub TXT.</p>}
        {query.data.map((material) => <EssayMaterialRow key={material.id} material={material} course={brief.course} selected={brief.materialIds.includes(material.id)} onToggle={() => toggle(material.id)} />)}
      </div>}
      {!open && brief.materialIds.map((id) => {
        const material = query.data.find((item) => item.id === id)
        return <div key={id} className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          <span className="min-w-0 flex-1 break-words">{material?.title ?? (query.isFetching ? 'Pobieranie materiału...' : 'Materiał niedostępny')}{material && !material.ready && (material.indexStatus === 'pending' ? ' · przygotowywanie...' : ' · wymaga przygotowania')}</span>
          <Button variant="ghost" size="sm" onClick={() => toggle(id)} aria-label="Usuń materiał z pracy"><X className="size-4" /></Button>
        </div>
      })}
    </section>
  )
}
