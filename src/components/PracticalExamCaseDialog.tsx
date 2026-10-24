'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'
import PracticalExamCase from '@/components/PracticalExamCase'
import type { PracticalExamCaseDialogProps } from '@/types/practicalExamWorkspaceTypes'

export default function PracticalExamCaseDialog({ exam, onClose }: PracticalExamCaseDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return createPortal(
    <dialog ref={dialog} aria-label='Szczegóły przypadku' onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }} className='fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[92vw] max-w-md border-0 bg-white p-0 shadow-xl backdrop:bg-black/40'>
      <div className='flex items-center justify-between border-b border-zinc-200 px-5 py-3'>
        <h2 className='text-sm font-semibold text-zinc-800'>Szczegóły przypadku</h2>
        <Button variant='ghost' onClick={onClose} aria-label='Zamknij szczegóły' className='min-h-11 min-w-11'><X size={18} /></Button>
      </div>
      <PracticalExamCase exam={exam} />
    </dialog>,
    document.body,
  )
}
