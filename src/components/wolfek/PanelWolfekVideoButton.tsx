'use client'

import { Video } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function PanelWolfekVideoButton({ available, onClick, onHoverChange }: {
  available: boolean
  onClick: () => void
  onHoverChange: (hovered: boolean) => void
}) {
  const reduced = useReducedMotion()
  return <Button type="button" variant="secondary" size="sm" shape="pill"
    className="panel-wolfek-video-button" aria-label="Otwórz film Wolfka"
    title="Film Wolfka" onPointerEnter={() => onHoverChange(true)}
    onPointerLeave={() => onHoverChange(false)}
    onPointerCancel={() => onHoverChange(false)}
    onClick={() => { onHoverChange(false); onClick() }}>
    {available && !reduced && <motion.span className="panel-wolfek-video-ping" aria-hidden="true"
      animate={{ scale: [1, 1.55], opacity: [.65, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }} />}
    <Video size={20} aria-hidden="true" />
  </Button>
}
