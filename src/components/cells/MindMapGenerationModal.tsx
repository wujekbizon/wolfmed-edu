'use client'

import { createPortal } from 'react-dom'
import AIGenerationModal from '@/components/modal/AIGenerationModal'

const STATUS_MESSAGES = [
  'Analizuję temat…',
  'Buduję strukturę gałęzi…',
  'Dobieram kategorie i ikony…',
  'Rozmieszczam węzły…',
  'Finalizuję mapę…',
]

// The generate form lives deep inside a cell (ResizableComponent under a
// position: relative layout), where position: fixed breaks — so the modal
// portals to document.body per the CLAUDE.md modal rule.
export default function MindMapGenerationModal() {
  return createPortal(
    <AIGenerationModal
      title="Generuję mapę myśli"
      statusMessages={STATUS_MESSAGES}
      hint="To potrwa kilka chwil. AI buduje interaktywną mapę myśli."
    />,
    document.body
  )
}
