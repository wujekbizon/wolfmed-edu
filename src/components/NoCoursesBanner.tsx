'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Info, X } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NoCoursesBanner() {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const isOpen = params.get('from') === 'panel'

  const hide = () => {
    const nextParams = new URLSearchParams(params.toString())
    nextParams.delete('from')
    const query = nextParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  if (!isOpen) return null

  return (
    <div className="kierunki-access-notice" role="status">
      <Info size={18} aria-hidden="true" />
      <p>Aby rozpocząć naukę w panelu, wybierz swój pierwszy kurs. Wolfek pomoże Ci zdecydować.</p>
      <Button variant="ghost" size="sm" shape="pill" onClick={hide} aria-label="Zamknij informację">
        <X size={17} aria-hidden="true" />
      </Button>
    </div>
  )
}
