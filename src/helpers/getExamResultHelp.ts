import { PRACTICAL_PASSING_PERCENT } from '@/types/praktycznyTypes'
import type { ExamResult } from '@/types/praktycznyTypes'
import type { ExamResultHelp } from '@/types/practicalExamResultTypes'
import { getExamResultSections } from '@/helpers/getExamResultSections'

export function getExamResultHelp(result: ExamResult, question: string): ExamResultHelp {
  if (question === 'score') return {
    text: `Twój wynik to ${result.percent}%: ${result.earned} z ${result.max} punktów. Próg zaliczenia wynosi ${PRACTICAL_PASSING_PERCENT}%. ${result.passed ? 'Arkusz został zaliczony.' : 'Arkusz nie został zaliczony.'} W podsumowaniu znajdziesz punkty za poszczególne części.`,
    target: { tab: 'summary', id: '' },
  }
  if (question === 'lost') {
    const sections = getExamResultSections(result).filter((section) => section.earned < section.max)
    const first = sections[0]
    return {
      text: first ? `Punkty do poprawy znajdziesz w tych częściach:\n${sections.map((section) => `${section.title}: ${section.earned} z ${section.max} punktów.`).join('\n')} Otwórz szczegóły, aby porównać odpowiedzi z kluczem.` : 'W zwróconych wynikach czynności i dokumentacji nie ma części z utraconymi punktami. Pełny wynik widzisz w podsumowaniu.',
      target: first ? { tab: first.tab, id: first.id } : null,
    }
  }
  if (question === 'compare') return {
    text: 'Po lewej znajdziesz swoją odpowiedź, po prawej klucz; na telefonie są ułożone jedna pod drugą. Przy czynnościach porównujesz tę samą pozycję w obu kolejnościach. Przy listach klucz pokazuje przykładowe poprawne odpowiedzi. Punkty dotyczą całego pola — nie oznaczają oceny każdego wpisu osobno. „Brak odpowiedzi” oznacza puste pole.',
    target: null,
  }
  return { text: '', target: null }
}
