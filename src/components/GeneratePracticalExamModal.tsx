'use client'

import AIGenerationModal from '@/components/modal/AIGenerationModal'

const STATUS_MESSAGES = [
  'Tworzę nowy przypadek pacjenta…',
  'Układam karty dokumentacji…',
  'Dobieram czynności i procedury…',
  'Przygotowuję klucz odpowiedzi…',
  'Finalizuję arkusz…',
]

export default function GeneratePracticalExamModal() {
  return (
    <AIGenerationModal
      title="Generuję nowy arkusz"
      statusMessages={STATUS_MESSAGES}
      hint="To potrwa kilka chwil. AI przygotowuje kompletny arkusz MED.14."
    />
  )
}
