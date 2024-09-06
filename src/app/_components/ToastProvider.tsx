'use client'

import { Toaster } from 'react-hot-toast'

interface ToastProviderProps {
  children: React.ReactNode
}

export default function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            borderRadius: '10px',
            borderWidth: '1px',
            borderColor: 'rgb(254 202 202 / 0.6)',
            background: '#ffd4d4',
            color: '#0e0e11',
          },
        }}
      />
    </>
  )
}
