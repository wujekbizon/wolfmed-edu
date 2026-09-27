'use client'

import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { WolfekAvatarProps } from '@/types/wolfekTypes'
import WolfekFace from './WolfekFace'

export default function WolfekAvatar({ positive, supportive, interactive, reaction, gaze }: WolfekAvatarProps) {
  const id = useId().replaceAll(':', '')
  const reduced = useReducedMotion()
  const gesture = reduced || !reaction ? { rotateX: 0, rotateY: 0, x: 0, y: 0, scaleY: 1 }
    : reaction.gesture === 'yes'
      ? { rotateX: [0, 24, -10, 18, 0], y: [0, 7, -3, 4, 0], scaleY: [1, .93, 1.02, .96, 1] }
      : { rotateY: [0, -24, 22, -15, 9, 0], x: [0, -6, 6, -4, 2, 0] }

  return <span className="wolfek-avatar" aria-hidden={interactive ? undefined : true}>
    <span className="wolfek-avatar-aura" />
    <span className="wolfek-avatar-head">
      <motion.span key={reaction?.eventId ?? 'idle'} className="wolfek-avatar-gesture"
        initial={{ rotateX: 0, rotateY: 0, x: 0, y: 0, scaleY: 1 }}
        animate={gesture} transition={{ duration: reduced ? 0 : 1, ease: 'easeInOut' }}>
        <WolfekFace id={id} positive={positive} supportive={supportive}
          reduced={reduced} interactive={interactive} gaze={gaze} />
      </motion.span>
    </span>
    <span className="wolfek-avatar-shadow" />
  </span>
}
