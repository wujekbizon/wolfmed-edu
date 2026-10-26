'use client'

import AIGenerationModal from '@/components/modal/AIGenerationModal'
import { PRACTICAL_EXAM_GENERATION_MESSAGES } from '@/constants/practicalExamGeneration'

export default function GeneratePracticalExamModal() {
  return (
    <AIGenerationModal
      title="Generuję nowy arkusz"
      statusMessages={PRACTICAL_EXAM_GENERATION_MESSAGES}
      hint="To potrwa kilka chwil. AI przygotowuje kompletny arkusz MED.14."
    />
  )
}
