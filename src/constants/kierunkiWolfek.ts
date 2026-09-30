import type { KierunkiWolfekTopic } from '@/types/kierunkiWolfekTypes'

export const KIERUNKI_WOLFEK_VERSION = 'kierunki-v1'
export const KIERUNKI_CATALOG_ANCHOR = 'kierunki-katalog'

export const KIERUNKI_WOLFEK_TOPICS: Record<KierunkiWolfekTopic, {
  label: string
  criteria: string
}> = {
  exam_preparation: { label: 'Chcę zdać egzamin', criteria: 'Visitor mainly wants to pass the Opiekun Medyczny state exam and wants exam practice.' },
  opiekun_growth: { label: 'Chcę rozwijać się jako opiekun', criteria: 'Visitor wants to improve practical knowledge or skills for day-to-day work as an Opiekun Medyczny.' },
  nursing_journey: { label: 'Szukam długiej ścieżki nauki', criteria: 'Visitor is interested in a long-term Pielęgniarstwo learning path, semester materials, subjects, tests or tools.' },
  course_selection: { label: 'Pomóż mi wybrać kierunek', criteria: 'Visitor is unsure which course or career path fits their goal.' },
  pricing: { label: 'Porównaj ceny i plany', criteria: 'Visitor asks for course prices, tier features, checkout availability or how to compare plans.' },
  payment_models: { label: 'Subskrypcja czy płatność jednorazowa?', criteria: 'Visitor asks about monthly subscription versus one-time lifetime access, billing or payment options.' },
  tier_comparison: { label: 'Co zawiera Basic i Premium?', criteria: 'Visitor asks what each access tier includes or which tier to choose.' },
  english_course: { label: 'Angielski medyczny', criteria: 'Visitor asks about the medical English course or adding it to Nursing or Opiekun Medyczny.' },
  owned_course: { label: 'Mam już dostęp do kursu', criteria: 'Signed-in visitor asks about an already owned course or how to continue using it.' },
}

export const KIERUNKI_WOLFEK_TOPIC_IDS = Object.keys(KIERUNKI_WOLFEK_TOPICS) as KierunkiWolfekTopic[]
export const KIERUNKI_WOLFEK_FEATURED_TOPICS: KierunkiWolfekTopic[] = [
  'exam_preparation', 'opiekun_growth', 'nursing_journey', 'payment_models', 'course_selection',
]
