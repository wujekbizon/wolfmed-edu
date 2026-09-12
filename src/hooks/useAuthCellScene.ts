'use client'

import { useEffect, useRef, useState } from 'react'
import { createAuthCellScene } from '@/helpers/createAuthCellScene'

export function useAuthCellScene(paused: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<ReturnType<typeof createAuthCellScene> | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      sceneRef.current = createAuthCellScene(canvas)
      setReady(true)
    } catch {
      setReady(false)
      return
    }
    const onContextLost = () => {
      sceneRef.current?.setPaused(true)
      setReady(false)
    }
    canvas.addEventListener('webglcontextlost', onContextLost)
    return () => {
      canvas.removeEventListener('webglcontextlost', onContextLost)
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => { sceneRef.current?.setPaused(paused) }, [paused])

  return { canvasRef, ready }
}
