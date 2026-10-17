import { BookOpen, BriefcaseMedical, Compass, CreditCard, GraduationCap, Languages, Layers, UserRound, Wallet, type LucideIcon } from 'lucide-react'
import type { KierunkiWolfekTopic } from '@/types/kierunkiWolfekTypes'

export const KIERUNKI_WOLFEK_ICONS: Record<KierunkiWolfekTopic, LucideIcon> = {
  exam_preparation: GraduationCap,
  opiekun_growth: BriefcaseMedical,
  nursing_journey: BookOpen,
  course_selection: Compass,
  pricing: Wallet,
  payment_models: CreditCard,
  tier_comparison: Layers,
  english_course: Languages,
  owned_course: UserRound,
}
