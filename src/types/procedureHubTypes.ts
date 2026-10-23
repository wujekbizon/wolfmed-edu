import type { ReactNode } from 'react'

export interface CourseProcedureCard {
  slug: string
  title: string
  subtitle: string
  description: string
  href: string
  image: string
  learningTime: string
  features: string[]
}

export interface ProcedureHubEnrollment { slug: string }
export interface ProceduresHubProps { cards: CourseProcedureCard[] }
export interface ProcedureHubCardProps { card: CourseProcedureCard }
export interface ProceduresHubLayoutProps {
  panels: { id: string; label: string; content: ReactNode }[]
}
