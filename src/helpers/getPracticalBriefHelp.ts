import { PRACTICAL_PASSING_PERCENT } from '@/types/praktycznyTypes'
import type { PublicExam } from '@/types/praktycznyTypes'

export function getPracticalBriefHelp(exam: PublicExam, question: string) {
  switch (question) {
    case 'task':
      return `Polecenie tego arkusza: ${exam.taskSummary}`
    case 'documents':
      return `Po rozpoczęciu egzaminu uzupełnij karty: ${exam.forms.map((form) => form.title).join('; ')}. Czytaj etykiety i jednostki przy polach. Wpisuj odpowiedzi w przeznaczonych miejscach, a w polach wyboru zaznaczaj opcje. Opis pacjenta i polecenie znajdziesz także w szczegółach przypadku.`
    case 'grading':
      return `Po wybraniu „Zakończ i sprawdź arkusz” aplikacja porówna odpowiedzi i kolejność czynności z kluczem. Próg zaliczenia wynosi ${PRACTICAL_PASSING_PERCENT}%. Wynik zawiera punkty i rozwiązania. To ćwiczenie w aplikacji; wykonanie czynności przy pacjencie na prawdziwym egzaminie ocenia egzaminator.`
    case 'timer':
      return `Odliczanie rozpocznie się dopiero po wybraniu „Rozpocznij egzamin”. Na ten arkusz masz ${exam.durationMinutes} minut. Przeglądanie zakładek i pytań do Wolfka przed rozpoczęciem nie uruchamia czasu.`
    default:
      return ''
  }
}
