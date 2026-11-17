'use client'

import { useRef } from 'react'
import { UploadButton } from '@/utils/uploadthing'
import { parseUploadError } from '@/helpers/uploadErrors'
import { showToast } from '@/hooks/useToastMessage'
import type { MaterialUploadButtonProps } from '@/types/materialsTypes'

export default function MaterialUploadButton({ onUploaded, essay = false }: MaterialUploadButtonProps) {
  const fileType = useRef<string | null>(null)
  return (
    <UploadButton
      endpoint={essay ? 'essayMaterialUploader' : 'materialUploader'}
      onBeforeUploadBegin={(files) => {
        fileType.current = files[0]?.type ?? null
        return files
      }}
      onUploadError={(error) => showToast('ERROR', parseUploadError(error, fileType.current))}
      onClientUploadComplete={(files) => {
        const file = files[0]
        if (!file?.key || !file.ufsUrl || !file.type) {
          showToast('ERROR', 'Nie udało się odczytać przesłanego pliku.')
          return
        }
        onUploaded({ key: file.key, url: file.ufsUrl, type: file.type, name: file.name, size: file.size })
      }}
      appearance={{
        button: 'ut-ready:bg-slate-500 hover:ut-ready:bg-slate-500/80 ut-readying:bg-slate-600 ut-uploading:cursor-not-allowed rounded-r-none bg-red-500 bg-none after:bg-orange-400',
        container: 'w-max max-w-full flex-row flex-wrap rounded-md border-cyan-300 bg-slate-200',
        allowedContent: 'flex min-h-8 flex-col items-center justify-center px-2 font-semibold text-zinc-900',
      }}
      uploadProgressGranularity="fine"
    />
  )
}
