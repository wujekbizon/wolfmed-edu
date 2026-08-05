'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { CAMERA_SUPPRESS_BUFFER_MS, SCENE_FOCUS } from '@/constants/diagramCanvas'

/**
 * The single owner of camera movement for a diagram.
 *
 * Auto-fit only holds while the view is still ours. Once the student pans or
 * zooms, refitting on every container resize would drag them out of whatever
 * they were reading, so auto-fit switches off until they ask for it back.
 *
 * Programmatic moves emit the same scroll events a student does — one animated
 * fit produced ~19 — so every move raises a suppression token first. Without it
 * the first auto-fit would immediately mark the camera as manually controlled.
 */
export function useDiagramCamera(excalidrawAPI: ExcalidrawImperativeAPI | null) {
  const [isAuto, setIsAuto] = useState(true)
  const isAutoRef = useRef(true)
  const suppressedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const move = useCallback(
    (animate: boolean) => {
      if (!excalidrawAPI) return
      const elements = excalidrawAPI.getSceneElements()
      if (elements.length === 0) return

      suppressedRef.current = true
      if (timerRef.current) clearTimeout(timerRef.current)

      excalidrawAPI.scrollToContent(elements, {
        fitToContent: true,
        animate,
        duration: SCENE_FOCUS.duration,
      })

      timerRef.current = setTimeout(
        () => {
          suppressedRef.current = false
        },
        (animate ? SCENE_FOCUS.duration : 0) + CAMERA_SUPPRESS_BUFFER_MS
      )
    },
    [excalidrawAPI]
  )

  /** A resize or a new scene: reframe only while the view is still ours. */
  const fitAuto = useCallback(
    (animate = false) => {
      if (isAutoRef.current) move(animate)
    },
    [move]
  )

  /** The student asking for the diagram back: always fits, and re-arms auto. */
  const resume = useCallback(() => {
    isAutoRef.current = true
    setIsAuto(true)
    move(true)
  }, [move])

  /**
   * Hands the camera back without moving it yet, for an explicit action that is
   * about to change the container anyway — entering fullscreen re-arms here and
   * lets the resize observer fit once the new layout has settled, rather than
   * fitting twice against a size that is still changing.
   */
  const armAuto = useCallback(() => {
    isAutoRef.current = true
    setIsAuto(true)
  }, [])

  // Runs at pointer frequency during a pan — keep it to a ref read.
  const notifyScroll = useCallback(() => {
    if (suppressedRef.current || !isAutoRef.current) return
    isAutoRef.current = false
    setIsAuto(false)
  }, [])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  return { isAuto, fitAuto, resume, armAuto, notifyScroll }
}
