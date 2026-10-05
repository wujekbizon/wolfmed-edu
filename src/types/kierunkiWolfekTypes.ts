import type { FormState } from './actionTypes'
import type { PaymentOffer } from './paymentTypes'

export type KierunkiWolfekCourseSlug = PaymentOffer['courseSlug']

export type KierunkiWolfekTopic =
  | 'exam_preparation' | 'opiekun_growth' | 'nursing_journey'
  | 'course_selection' | 'pricing' | 'payment_models'
  | 'tier_comparison' | 'english_course' | 'owned_course'

export type KierunkiWolfekOffer = {
  tier: 'basic' | 'premium'
  model: 'subscription' | 'lifetime'
  price: string
  available: boolean
}

export type KierunkiWolfekContext = {
  route: 'kierunki'
  visitor: {
    signedIn: boolean
    ownedCourses: Array<{ slug: KierunkiWolfekCourseSlug; tier: string }>
  }
  catalog: Array<{
    slug: KierunkiWolfekCourseSlug
    title: string
    offers: KierunkiWolfekOffer[]
  }>
}

export type KierunkiWolfekAnswer = {
  topic: KierunkiWolfekTopic
  text: string
  href?: string
  courseSlug?: KierunkiWolfekCourseSlug
}

export type KierunkiWolfekAskState = FormState & {
  answer?: KierunkiWolfekAnswer | null
  confidence?: number | null
}

export type KierunkiWolfekVideo = { title: string; url: string }
export type KierunkiCourseVideoButtonProps = { courseSlug: KierunkiWolfekCourseSlug }
export type KierunkiWolfekTopicsProps = {
  pending: boolean
  selectedTopic: KierunkiWolfekTopic | null
  onSelect: (topic: KierunkiWolfekTopic) => void
}
