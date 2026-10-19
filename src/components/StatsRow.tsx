import { BookOpen, Target, Star, GraduationCap } from 'lucide-react'
import StatCard from '@/components/StatCard'
import type { StatsRowProps } from '@/types/dashboardStatsTypes'

export default function StatsRow({
  totalQuestions,
  testsAttempted,
  totalScore,
  enrolledCount,
}: StatsRowProps) {
  const cards = [
    {
      icon: BookOpen,
      value: totalQuestions,
      label: 'Pytań rozwiązanych',
      accent: false,
      iconTone: 'lavender' as const,
    },
    {
      icon: Target,
      value: testsAttempted,
      label: 'Prób testów',
      accent: false,
      iconTone: 'rose' as const,
    },
    {
      icon: Star,
      value: totalScore,
      label: 'Łączny wynik',
      accent: true,
      iconTone: 'rose' as const,
    },
    {
      icon: GraduationCap,
      value: enrolledCount,
      label: enrolledCount === 1 ? 'Twój kurs' : 'Twoich kursów',
      accent: false,
      iconTone: 'lavender' as const,
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}
