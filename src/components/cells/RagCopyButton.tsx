'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import Button from '@/components/ui/Button'
import type { RagCopyButtonProps } from '@/types/ragCellUiTypes'

export default function RagCopyButton({ text }: RagCopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <Button variant='ghost' size='sm' onClick={copy} aria-label={copied ? 'Skopiowano odpowiedź' : 'Kopiuj odpowiedź'}
      className='shrink-0' title={copied ? 'Skopiowano' : 'Kopiuj odpowiedź'}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span className='hidden sm:inline'>{copied ? 'Skopiowano' : 'Kopiuj'}</span>
    </Button>
  )
}
