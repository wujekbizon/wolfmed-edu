import type { ReactNode } from 'react'

export type TabOption = { id: string; label: string }

export type TabNavigationProps = {
  id: string
  label: string
  options: readonly TabOption[]
  active: string
  onChange: (id: string) => void
  variant?: 'pills' | 'underline'
}

export type TabPanelProps = {
  id: string
  tabId: string
  active: boolean
  children: ReactNode
}
