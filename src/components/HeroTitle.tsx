'use client'
import { useRef } from 'react'
import { useWigglyText } from '@/hooks/useWigglyText'

function AnimatedChar({
  char,
  delay,
  isHoverable,
}: {
  char: string
  delay: string
  isHoverable: boolean
}) {
  const spanRef = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = () => {
    if (!isHoverable || !spanRef.current) return
    const el = spanRef.current
    el.style.animation = 'none'
    void el.offsetWidth // force reflow to re-trigger animation
    el.style.animation = 'rubberBand 1.2s'
    el.style.color = '#ff5b5b'
  }

  const handleAnimationEnd = () => {
    if (!spanRef.current || !isHoverable) return
    spanRef.current.style.animation = ''
    spanRef.current.style.color = ''
  }

  return (
    <span
      ref={spanRef}
      onMouseEnter={handleMouseEnter}
      onAnimationEnd={handleAnimationEnd}
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
      {char === ' ' ? '\u00A0' : char}
    </span>
  )
}

function WigglyWord({ text, startIdx }: { text: string; startIdx: number }) {
  const { chars, isHoverable } = useWigglyText(text, startIdx)
  return (
    <span>
      {chars.map((c, i) => (
        <AnimatedChar key={i} char={c.char} delay={c.delay} isHoverable={isHoverable} />
      ))}
    </span>
  )
}

export default function HeroTitle() {
  // startIdx values continue the stagger sequence across words:
  // line1: 'Edukacja' → 8 chars → idx 1–8
  // line2: 'medyczna' → 8 chars → idx 9–16
  // line3: rest       →           idx 17+
  return (
    <>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-zinc-800">
        <WigglyWord text="Edukacja" startIdx={1} />
        {' '}
        <span className="text-[#ff5b5b]">
          <WigglyWord text="medyczna" startIdx={9} />
        </span>
        <br />
        <WigglyWord text="może być jeszcze łatwiejsza." startIdx={17} />
      </h1>

      <p className="text-lg text-zinc-600 mb-8 max-w-xl place-self-center lg:place-self-start animate-fadeInUp [--slidein-delay:600ms]">
        Rozpocznij swoją podróż w świecie medycyny z naszą innowacyjną platformą edukacyjną.
      </p>
    </>
  )
}
