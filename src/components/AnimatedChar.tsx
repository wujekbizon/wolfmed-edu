'use client'
import { useRef } from 'react'

type AnimatedCharProps = {
  char: string
  delay: string
  isHoverable: boolean
}

export default function AnimatedChar({ char, delay, isHoverable }: AnimatedCharProps) {
  const spanRef = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = () => {
    if (!isHoverable || !spanRef.current) return
    const el = spanRef.current
    el.style.animation = 'rubberBand 1.2s'
    el.style.color = '#ff5b5b'
  }

  const handleMouseLeave = () => {
    if (!isHoverable || !spanRef.current) return
    spanRef.current.style.animation = ''
    spanRef.current.style.color = ''
  }

  return (
    <span
      ref={spanRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        isHoverable
          ? { display: 'inline-block', minWidth: '0.625rem', cursor: 'default' }
          : {
              display: 'inline-block',
              minWidth: '0.625rem',
              opacity: 0,
              animation: 'bounceIn 1.5s both',
              animationDelay: delay,
            }
      }
    >
      {char}
    </span>
  )
}
