import type { PracticeSession } from '@/types/learningPracticeServerTypes'
import type { PracticeView } from '@/types/learningPracticeTypes'

export function getPracticeTelemetryView(session: PracticeSession): PracticeView {
  return { id: session.id, category: session.category, startedAt: session.startedAt.toISOString(),
    version: session.version, index: session.activeIndex, total: session.items.length,
    status: session.status, cards: [], question: null, summary: session.summary }
}
