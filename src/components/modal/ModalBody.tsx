'use client'

interface ModalBodyProps {
  children: React.ReactNode
  className?: string
}

export default function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={`px-6 py-5 ${className ?? ''}`}>
      {children}
    </div>
  )
}
