import type { FormState } from './actionTypes'

export type PanelWolfekTopic =
  | 'first_steps' | 'username' | 'motto' | 'courses' | 'countdown'
  | 'results' | 'difficult_questions' | 'plan' | 'billing'
  | 'storage' | 'badges' | 'navigation' | 'forum' | 'feedback'

export type PanelWolfekAnswer = {
  topic: PanelWolfekTopic
  text: string
  href?: string
}

export type PanelWolfekVideo = {
  title: string
  url: string
}

export type PanelWolfekAskState = FormState & {
  answer?: PanelWolfekAnswer | null
  confidence?: number | null
}

export type PanelWolfekContext = {
  route: 'panel.home'
  courses: { slug: string; tier: string }[]
}
