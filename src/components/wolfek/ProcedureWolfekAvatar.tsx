'use client'

import { useState, useSyncExternalStore } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Button from '@/components/ui/Button'
import WolfekAvatar from './WolfekAvatar'
import WolfekSyringe from './WolfekSyringe'
import { PROCEDURE_WOLFEK_FLINCH, PROCEDURE_WOLFEK_SYRINGE, PROCEDURE_WOLFEK_TRANSITION } from '@/constants/procedureWolfekAnimation'
import type { ProcedureWolfekAvatarProps } from '@/types/procedureWolfekTypes'

export default function ProcedureWolfekAvatar({ avatarRef, gaze }: ProcedureWolfekAvatarProps) {
  const reduced = useReducedMotion()
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const [replay, setReplay] = useState(0)
  const [startled, setStartled] = useState(false)
  const moving = mounted && reduced === false
  const scared = moving && startled

  return (
    <div ref={avatarRef} className='relative h-32 w-32 shrink-0'>
      <motion.div key={`head-${replay}`} className='absolute inset-x-2 top-2 h-28'
        initial={{ x: 0, y: 0, rotate: 0 }}
        animate={moving ? PROCEDURE_WOLFEK_FLINCH : { x: 0, y: 0, rotate: 0 }}
        transition={moving ? PROCEDURE_WOLFEK_TRANSITION : { duration: 0 }}
        onAnimationComplete={() => setStartled(false)}>
        <WolfekAvatar positive supportive excited interactive={false} gaze={gaze} expression={scared ? 'scared' : 'relieved'} />
      </motion.div>
      <motion.div key={`syringe-${replay}`} className='absolute -right-3 top-22'
          initial={{ x: 32, y: 6, rotate: 8, opacity: 0 }}
          animate={moving ? PROCEDURE_WOLFEK_SYRINGE : { x: mounted ? -48 : 32, y: mounted ? 24 : 6, rotate: mounted ? -45 : 8, opacity: mounted ? 1 : 0 }}
          onUpdate={latest => { if (moving && typeof latest.x === 'number' && latest.x < 4 && typeof latest.y === 'number' && latest.y <= 2) setStartled(true) }}
          onAnimationComplete={() => setStartled(false)}
          transition={moving ? PROCEDURE_WOLFEK_TRANSITION : { duration: 0 }}>
        <Button variant='ghost' size='sm' className='min-h-14 min-w-14 rounded-xl p-0! focus-visible:ring-rose-400' style={{ backgroundColor: 'transparent' }}
          onClick={() => { setStartled(false); setReplay(value => value + 1) }} aria-label='Wolfek i strzykawka — odtwórz animację'>
          <WolfekSyringe />
        </Button>
      </motion.div>
    </div>
  )
}
