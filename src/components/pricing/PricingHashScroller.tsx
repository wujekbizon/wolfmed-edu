'use client'

import { useEffect } from 'react'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'

export default function PricingHashScroller() {
  useEffect(() => {
    if (window.location.hash !== '#' + PRICING_ANCHOR) return
    const target = document.getElementById(PRICING_ANCHOR)
    if (!target) return
    const align = () => target.scrollIntoView({ block: 'start', behavior: 'instant' })
    const frame = requestAnimationFrame(align)
    if (document.readyState !== 'complete') window.addEventListener('load', align, { once: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('load', align)
    }
  }, [])
  return null
}
