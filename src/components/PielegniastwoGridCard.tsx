'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, Award } from 'lucide-react'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'
import { getPielegniastwoSlug } from '@/lib/pielegniastwoUtils'

const PLACEHOLDER_IMAGE =
  'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5oNgZgSvSLyQhzP6mdErKItkOUcXlTqiNMavY'

export default function PielegniastwoGridCard({
  procedure,
}: {
  procedure: PielegniastwoProcedure
}) {
  const slug = getPielegniastwoSlug(procedure)
  const totalSteps = procedure.sections.reduce((acc, s) => acc + s.steps.length, 0)

  return (
    <div className="relative group border border-zinc-400/60 bg-white flex flex-col p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="aspect-square w-full h-[300px] relative overflow-hidden">
        <Image
          src={PLACEHOLDER_IMAGE}
          alt={procedure.name}
          width={800}
          height={600}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex flex-col grow">
        <h3 className="text-base font-bold text-zinc-800 mb-2 line-clamp-2 leading-tight">
          {procedure.name}
        </h3>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            {procedure.executionTime}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <Award className="w-3.5 h-3.5" />
            {procedure.passingPoints}/{procedure.totalPoints} pkt
          </span>
          <span className="text-xs text-zinc-400">{totalSteps} kroków</span>
        </div>

        <div className="mt-auto flex justify-end">
          <Link
            href={`/panel/procedury/pielegniarstwo/${slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-all hover:gap-2"
          >
            Otwórz procedurę
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
