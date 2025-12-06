"use client"

import MaterialCard from "./MaterialCard"
import type { MaterialsType } from "@/types/materialsTypes"
import { useMaterialModalStore } from "@/store/useMaterialModalStore"

type Props = {
  materials: MaterialsType[]
}

export default function MaterialsSection({ materials }: Props) {
  const { openUploadModal } = useMaterialModalStore()

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-800">Materiały i Zasoby</h2>
        <button
          className="bg-slate-600 text-white px-4 py-2 cursor-pointer rounded-full text-sm font-medium hover:bg-slate-700 transition-colors"
          onClick={openUploadModal}
        >
          Dodaj Materiał
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </div>
      {materials.length === 0 && (
        <div className="flex w-full flex-col items-center justify-center">
          <div className="text-5xl mb-4 text-zinc-300">📝</div>
          <h3 className="text-xl text-zinc-500 mb-2 font-medium">
            Brak dostepnych materiałów
          </h3>
          <p className="text-zinc-400">Dodaj swój pierwszy materiał!</p>
        </div>
      )}
    </div>
  )
}
