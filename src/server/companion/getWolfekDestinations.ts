import 'server-only'
import { PANEL_WOLFEK_TARGETS } from '@/constants/panelWolfek'
import { KIERUNKI_WOLFEK_VIDEOS } from '@/constants/kierunkiWolfekVideos'
import type { WolfekAction } from '@/types/wolfekResponseTypes'
import type { PanelWolfekTopic } from '@/types/panelWolfekTypes'

export function getWolfekDestinations(): Record<string, WolfekAction> {
  const links: Record<string, string> = {
    learning: '/panel/nauka', ownedCourses: '/panel/kursy', plan: '/panel/plan', tests: '/panel/testy',
    forum: '/forum', catalog: '/kierunki#kierunki-katalog', signIn: '/sign-in',
    opiekunCourse: '/kierunki/opiekun-medyczny', nursingCourse: '/kierunki/pielegniarstwo',
    englishCourse: '/kierunki/angielski-medyczny', analyticsCategories: '/panel',
  }
  const destinations: Record<string, WolfekAction> = Object.fromEntries(
    Object.entries(links).map(([key, href]) => [key, { type: 'link', href }]))
  const targets: Record<string, PanelWolfekTopic> = { firstSteps: 'first_steps', usernameForm: 'username',
    mottoForm: 'motto', countdown: 'countdown', analytics: 'results', difficultQuestions: 'difficult_questions',
    billing: 'billing', storage: 'storage', badges: 'badges', features: 'navigation', feedback: 'feedback' }
  for (const [key, topic] of Object.entries(targets)) destinations[key] = {
    type: 'locate', targetId: PANEL_WOLFEK_TARGETS[topic],
  }
  for (const slug of ['opiekun-medyczny', 'pielegniarstwo', 'angielski-medyczny'] as const) {
    destinations[`requestedCourse:${slug}`] = { type: 'link', href: `/kierunki/${slug}`, courseSlug: slug }
    if (KIERUNKI_WOLFEK_VIDEOS[slug]) destinations[`requestedCourseVideo:${slug}`] = { type: 'video', courseSlug: slug }
  }
  return destinations
}
