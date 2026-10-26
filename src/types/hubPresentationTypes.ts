import type { ReactNode } from 'react'

export interface HubPanelProps {
  image: string
  subtitle: string
  title: string
  children: ReactNode
  fixedHeight?: boolean
}

export interface HubStat {
  icon: ReactNode
  value: string
  label: string
}
export interface HubStatsProps { stats: HubStat[] }
