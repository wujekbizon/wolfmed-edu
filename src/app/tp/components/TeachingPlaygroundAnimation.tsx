'use client'

import { useEffect, useRef } from 'react'

export default function TeachingPlaygroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    // Animation parameters
    let points: { x: number; y: number; vx: number; vy: number }[] = []
    const numPoints = 50
    const connectionRadius = 150
    const pointRadius = 2
    let rotation = 0

    // Create initial points
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
      })
    }

    // Animation function
    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw globe
      const centerX = canvas.width / 2
      // Adjust centerY based on screen size
      const centerY = window.innerWidth <= 768 
        ? canvas.height * 0.3  // Position higher on mobile
        : canvas.height / 2    // Center on desktop
      
      // Make globe bigger and responsive
      const baseRadius = Math.min(canvas.width, canvas.height)
      const radius = window.innerWidth <= 768
        ? baseRadius * 0.35    // Bigger on mobile
        : baseRadius * 0.3     // Slightly bigger on desktop

      // Draw globe with gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      gradient.addColorStop(0, 'rgba(96, 165, 250, 0.2)') // blue-400
      gradient.addColorStop(1, 'rgba(167, 139, 250, 0.2)') // violet-400

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw globe lines
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.3)'
      ctx.lineWidth = 1

      // Draw latitude lines
      for (let i = -4; i <= 4; i++) {
        const y = radius * Math.sin((i / 4) * (Math.PI / 2))
        const r = Math.abs(Math.cos((i / 4) * (Math.PI / 2)) * radius)

        if (r > 0) {
          ctx.beginPath()
          ctx.ellipse(centerX, centerY + y, r, r * 0.2, 0, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Draw longitude lines
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + rotation
        const radiusX = radius
        const radiusY = radius * 0.2

        ctx.beginPath()
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(angle)
        ctx.scale(1, 0.2)
        ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2)
        ctx.restore()
        ctx.stroke()
      }

      // Update and draw points
      points.forEach((point, i) => {
        // Update position
        point.x += point.vx
        point.y += point.vy

        // Bounce off edges
        if (point.x < 0 || point.x > canvas.width) point.vx *= -1
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1

        // Draw point
        ctx.beginPath()
        ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(167, 139, 250, 0.6)'
        ctx.fill()

        // Draw connections
        points.slice(i + 1).forEach((otherPoint) => {
          const dx = otherPoint.x - point.x
          const dy = otherPoint.y - point.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionRadius) {
            ctx.beginPath()
            ctx.moveTo(point.x, point.y)
            ctx.lineTo(otherPoint.x, otherPoint.y)
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.3 * (1 - distance / connectionRadius)})`
            ctx.stroke()
          }
        })
      })

      // Rotate globe
      rotation += 0.002

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', setCanvasSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10"
      style={{ filter: 'blur(0.5px)' }}
    />
  )
} 