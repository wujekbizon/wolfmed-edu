'use client'

import { createContext, useContext } from 'react'

interface CellFullscreenContextValue {
  isFullscreen: boolean
}

const CellFullscreenContext = createContext<CellFullscreenContextValue>({ isFullscreen: false })

export const CellFullscreenProvider = CellFullscreenContext.Provider

/** Read whether the enclosing cell is currently expanded to fullscreen. */
export function useCellFullscreen(): boolean {
  return useContext(CellFullscreenContext).isFullscreen
}
