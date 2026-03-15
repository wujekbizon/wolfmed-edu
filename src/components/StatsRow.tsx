import { BookOpen, Target, Star, GraduationCap } from 'lucide-react'

interface StatsRowProps {
  totalQuestions: number
  testsAttempted: number
  totalScore: number
  enrolledCount: number
}

export default function StatsRow({
  totalQuestions,
  testsAttempted,
  totalScore,
  enrolledCount,
}: StatsRowProps) {
  const cards = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      value: totalQuestions,
      label: 'Pytań rozwiązanych',
      accent: false,
    },
    {
      icon: <Target className="w-5 h-5" />,
      value: testsAttempted,
      label: 'Prób testów',
      accent: false,
    },
    {
      icon: <Star className="w-5 h-5" />,
      value: totalScore,
      label: 'Łączny wynik',
      accent: true,
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      value: enrolledCount,
      label: enrolledCount === 1 ? 'Twój kurs' : 'Twoich kursów',
      accent: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`rounded-2xl p-4 flex flex-col gap-1.5 ${
            card.accent
              ? 'bg-zinc-700 border border-rose-500/30'
              : 'bg-zinc-800 border border-white/[0.06]'
          }`}
        >
          <span className={card.accent ? 'text-rose-400' : 'text-zinc-400'}>
            {card.icon}
          </span>
          <span
            className={`text-2xl font-bold tabular-nums ${
              card.accent ? 'text-rose-300' : 'text-white'
            }`}
          >
            {card.value}
          </span>
          <span className="text-xs text-zinc-400">{card.label}</span>
        </div>
      ))}
    </div>
  )
}
