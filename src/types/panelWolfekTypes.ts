import type { FormState } from './actionTypes'

export type PanelWolfekTopic =
  | 'first_steps' | 'username' | 'motto' | 'courses' | 'countdown'
  | 'results' | 'difficult_questions' | 'plan' | 'billing'
  | 'storage' | 'badges' | 'navigation' | 'forum' | 'feedback'
  | 'results_explain' | 'results_improve' | 'results_mistakes'
  | 'results_history' | 'results_categories'

export type PanelWolfekRoute = 'panel.home' | 'panel.results'
export type PanelWolfekResultsTopic = Extract<PanelWolfekTopic, `results_${string}`>

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

export type PanelWolfekContext =
  | { route: 'panel.home'; courses: { slug: string; tier: string }[] }
  | { route: 'panel.results' }
