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
    // animation was cleared on mouseLeave so setting it here always starts fresh
    el.style.animation = 'rubberBand 1.2s'
    el.style.color = '#ff5b5b'
  }

  const handleMouseLeave = () => {
    if (!spanRef.current) return
    // clear both so the next mouseEnter starts the animation from scratch
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

// whiteSpace: nowrap prevents the browser from breaking lines between individual inline-block chars
function WigglyWord({ text, startIdx }: { text: string; startIdx: number }) {
  const { chars, isHoverable } = useWigglyText(text, startIdx)
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {chars.map((c, i) => (
        <AnimatedChar key={i} char={c.char} delay={c.delay} isHoverable={isHoverable} />
      ))}
    </span>
  )
}

export default function HeroTitle() {
  // Each word is a separate WigglyWord so white-space: nowrap works correctly.
  // startIdx continues the stagger sequence: Edukacja(1-8) medyczna(9-16)
  // może(17-20) być(21-23) jeszcze(24-30) łatwiejsza.(31-41)
  return (
    <>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-zinc-800">
        <WigglyWord text="Edukacja" startIdx={1} />
        {' '}
        <span className="text-[#ff5b5b]">
          <WigglyWord text="medyczna" startIdx={9} />
        </span>
        <br />
        <WigglyWord text="może" startIdx={17} />
        {' '}
        <WigglyWord text="być" startIdx={21} />
        {' '}
        <WigglyWord text="jeszcze" startIdx={24} />
        {' '}
        <WigglyWord text="łatwiejsza." startIdx={31} />
      </h1>

      <p className="text-lg text-zinc-600 mb-8 max-w-xl place-self-center lg:place-self-start animate-fadeInUp [--slidein-delay:600ms]">
        Rozpocznij swoją podróż w świecie medycyny z naszą innowacyjną platformą edukacyjną.
      </p>
    </>
  )
}
