import {
  Award, BookOpen, CalendarClock, ChartNoAxesCombined, CreditCard,
  HardDrive, HelpCircle, MessageCircle, MessageSquare, NotebookTabs,
  Route, Target, UserRound, WandSparkles,
  type LucideIcon,
} from 'lucide-react'
import type { PanelWolfekTopic } from '@/types/panelWolfekTypes'

export const PANEL_WOLFEK_TOPIC_ICONS: Record<PanelWolfekTopic, LucideIcon> = {
  first_steps: BookOpen,
  username: UserRound,
  motto: WandSparkles,
  courses: NotebookTabs,
  countdown: CalendarClock,
  results: ChartNoAxesCombined,
  difficult_questions: Target,
  plan: Route,
  billing: CreditCard,
  storage: HardDrive,
  badges: Award,
  navigation: HelpCircle,
  forum: MessageCircle,
  feedback: MessageSquare,
}
