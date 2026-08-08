'use client'

import { useInView } from 'react-intersection-observer'

export default function FadeInSection({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={`transition-all duration-800 ease-in-out ${
        inView ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}
