'use client'

import { useDnaScene } from '@/hooks/useDnaScene'
import type { DnaSceneProps } from '@/types/notFoundTypes'
import DnaIllustration from './DnaIllustration'

export default function DnaScene({ paused }: DnaSceneProps) {
  const { canvasRef, ready } = useDnaScene(paused)

  return (
    <>
      {!ready && <DnaIllustration />}
      <canvas ref={canvasRef} className={`relative block h-full w-full ${ready ? '' : 'invisible'}`} aria-hidden />
    </>
  )
}
