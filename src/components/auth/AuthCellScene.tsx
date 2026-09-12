'use client'

import AuthCellIllustration from './AuthCellIllustration'
import { useAuthCellScene } from '@/hooks/useAuthCellScene'
import type { AuthSceneProps } from '@/types/authTypes'

export default function AuthCellScene({ paused }: AuthSceneProps) {
  const { canvasRef, ready } = useAuthCellScene(paused)

  return (
    <>
      {!ready && <AuthCellIllustration />}
      <canvas ref={canvasRef} className="relative block h-full w-full" aria-hidden />
    </>
  )
}
