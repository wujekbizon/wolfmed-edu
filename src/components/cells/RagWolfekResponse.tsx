'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { RagWolfekResponseProps } from '@/types/ragCellUiTypes'
import SourceChip from './SourceChip'
import RagCopyButton from './RagCopyButton'

export default function RagWolfekResponse({ answer, sources }: RagWolfekResponseProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .18 }}
      className='space-y-2'>
      <div className='w-fit max-w-full rounded-2xl rounded-tl-sm border border-violet-100 bg-white p-3 shadow-sm sm:p-4'>
        <div className='mb-2 flex items-center justify-between gap-3'>
          <h4 className='text-xs font-semibold text-[#80568e]'>Wolfek</h4>
          <RagCopyButton text={answer} />
        </div>
        <p className='whitespace-pre-wrap break-words text-sm leading-7 text-zinc-700'>{answer}</p>
      </div>
      {!!sources?.length && (
        <div className='px-1'>
          <p className='mb-1.5 text-[11px] font-medium text-zinc-400'>Źródła odpowiedzi</p>
          <div className='flex flex-wrap gap-1.5 [&>span]:min-w-0 [&>span]:max-w-full [&>span]:break-all'>
            {sources.map((source, index) => <SourceChip key={index} source={source} />)}
          </div>
        </div>
      )}
    </motion.div>
  )
}
