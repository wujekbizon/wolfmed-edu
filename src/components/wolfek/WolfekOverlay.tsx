'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useFloatingPanelPosition } from '@/hooks/useFloatingPanelPosition'
import type { WolfekOverlayProps } from '@/types/wolfekTypes'

export default function WolfekOverlay({ anchorId, visible, avatar, children, onMinimize, onOpen }: WolfekOverlayProps) {
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { panel, x, y, compact, ready } = useFloatingPanelPosition(anchorId, !visible || !mobileOpen, mounted)
  const minimized = !visible || (compact && !mobileOpen)
  useEffect(() => setMounted(true), [])
  const minimize = () => { setMobileOpen(false); onMinimize() }
  if (!mounted) return null

  return createPortal(<div className="wolfek-overlay">
    <motion.div ref={panel} className="wolfek-position" style={{ x, y }}
      data-minimized={minimized || !ready} aria-hidden={minimized || !ready} inert={minimized || !ready}>
      {children(minimize)}
    </motion.div>
    {minimized && <button type="button" className="wolfek-launcher" aria-label="Otwórz Wolfka"
      title="Wolfek — jestem obok" onClick={() => { setMobileOpen(true); onOpen() }}>
      {avatar}
      <span className="wolfek-launcher-label">Wolfek</span>
    </button>}
  </div>, document.body)
}
