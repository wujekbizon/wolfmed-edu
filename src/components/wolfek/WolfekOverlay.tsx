'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useFloatingPanelPosition } from '@/hooks/useFloatingPanelPosition'
import type { WolfekOverlayProps } from '@/types/wolfekTypes'

export default function WolfekOverlay({ anchorId, visible, avatar, children, onMinimize, onOpen }: WolfekOverlayProps) {
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const launcher = useRef<HTMLButtonElement>(null)
  const focusLauncher = useRef(false)
  const focusPanel = useRef(false)
  const { panel, x, y, compact, ready } = useFloatingPanelPosition(anchorId, !visible || !mobileOpen, mounted)
  const minimized = !visible || (compact && !mobileOpen)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (minimized && (focusLauncher.current || panel.current?.contains(document.activeElement))) {
      launcher.current?.focus()
      focusLauncher.current = false
    }
    if (!minimized && ready && focusPanel.current) {
      panel.current?.querySelector<HTMLElement>('[data-wolfek-focus-target]')?.focus()
      focusPanel.current = false
    }
  }, [minimized, ready, panel])
  const minimize = () => {
    focusLauncher.current = Boolean(panel.current?.contains(document.activeElement))
    if (focusLauncher.current && document.activeElement instanceof HTMLElement) document.activeElement.blur()
    setMobileOpen(false)
    onMinimize()
  }
  const open = () => {
    focusPanel.current = document.activeElement === launcher.current
    if (focusPanel.current) launcher.current?.blur()
    setMobileOpen(true)
    onOpen()
  }
  if (!mounted) return null

  return createPortal(<div className="wolfek-overlay">
    <motion.div ref={panel} className="wolfek-position" style={{ x, y }}
      data-minimized={minimized || !ready} inert={minimized || !ready}>
      {children(minimize)}
    </motion.div>
    {minimized && <button ref={launcher} type="button" className="wolfek-launcher" aria-label="Otwórz Wolfka"
      title="Wolfek — jestem obok" onClick={open}>
      {avatar}
      <span className="wolfek-launcher-label">Wolfek</span>
    </button>}
  </div>, document.body)
}
