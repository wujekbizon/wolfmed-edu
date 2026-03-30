'use client'

import { useWigglyText } from '@/hooks/useWigglyText'
import AnimatedChar from './AnimatedChar'

type WigglyWordProps = {
  text: string
  startIdx: number
}

export default function WigglyWord({ text, startIdx }: WigglyWordProps) {
  const { chars, isHoverable } = useWigglyText(text, startIdx)
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {chars.map((c, i) => (
        <AnimatedChar key={i} char={c.char} delay={c.delay} isHoverable={isHoverable} />
      ))}
    </span>
  )
}