'use client'

export default function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2 border-t border-white/[0.08]">
      {children}
    </div>
  )
}
