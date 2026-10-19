'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Tooltip } from '@/components/Tooltip'
import { useFloatingPanelPosition } from '@/hooks/useFloatingPanelPosition'
import { useWolfekPortalTarget } from '@/hooks/useWolfekPortalTarget'
import type { WolfekOverlayProps } from '@/types/wolfekTypes'

export default function WolfekOverlay({ anchorId, inlineAnchorId, variant = 'learning', visible, avatar, children, onMinimize, onOpen }: WolfekOverlayProps) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const launcher = useRef<HTMLButtonElement>(null)
  const focusLauncher = useRef(false)
  const focusPanel = useRef(false)
  const { host, inline } = useWolfekPortalTarget(inlineAnchorId)
  const { panel, x, y, compact, ready } = useFloatingPanelPosition(
    anchorId, !visible || !mobileOpen, mounted, variant === 'panel', !inline, inlineAnchorId ? 1025 : 1280,
  )
  const minimized = !visible || (!inline && compact && !mobileOpen)
  useEffect(() => {
    if (minimized && (focusLauncher.current || panel.current?.contains(document.activeElement))) {
      launcher.current?.focus()
      focusLauncher.current = false
    }
    if (!minimized && (ready || inline) && focusPanel.current) {
      panel.current?.querySelector<HTMLElement>('[data-wolfek-focus-target]')?.focus()
      focusPanel.current = false
    }
  }, [minimized, ready, panel, inline])
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

  return createPortal(<div className={`wolfek-overlay ${inline ? 'wolfek-inline' : ''}`} data-variant={variant}>
    <motion.div ref={panel} className="wolfek-position" style={{ x, y }}
      data-minimized={minimized || (!inline && !ready)} inert={minimized || (!inline && !ready)}>
      {/* eslint-disable-next-line react-hooks/refs -- The render prop receives an event handler; refs are read only when it is clicked. */}
      {children(minimize)}
    </motion.div>
    {minimized && (inline ? <button ref={launcher} type="button" className="wolfek-inline-launcher" onClick={open} aria-label="Otwórz Wolfka">
      <span className="wolfek-inline-launcher-avatar">{avatar}</span><span>Zapytaj Wolfka</span><span aria-hidden="true">＋</span>
    </button> : <Tooltip message="Wolfek — jestem obok" position="top-left"
      className="wolfek-launcher-tooltip">
      <button ref={launcher} type="button" className="wolfek-launcher" aria-label="Otwórz Wolfka" onClick={open}>
        {avatar}
        <span className="wolfek-launcher-label">Hej, jestem Wolfek!</span>
      </button>
    </Tooltip>)}
  </div>, host ?? document.body)
}
