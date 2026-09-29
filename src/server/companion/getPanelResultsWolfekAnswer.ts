import 'server-only'
import type { PanelWolfekAnswer, PanelWolfekResultsTopic } from '@/types/panelWolfekTypes'

export function getPanelResultsWolfekAnswer(topic: PanelWolfekResultsTopic): PanelWolfekAnswer {
  switch (topic) {
    case 'results_explain':
      return { topic, text: 'Wynik pokazuje liczbę poprawnych odpowiedzi względem wszystkich pytań. Wybierz „Zobacz szczegóły testu”, aby przejrzeć odpowiedzi.' }
    case 'results_improve':
      return { topic, text: 'Otwórz szczegóły testu, przejrzyj błędne odpowiedzi i wróć do tych zagadnień w sekcji „Nauka”.', href: '/panel/nauka' }
    case 'results_mistakes':
      return { topic, text: 'Przy wybranym teście kliknij „Zobacz szczegóły testu”. Błędne odpowiedzi są oznaczone na czerwono, a pod nimi znajdziesz poprawną odpowiedź.' }
    case 'results_history':
      return { topic, text: 'Tutaj masz historię ukończonych testów. Możesz zmienić sortowanie i otworzyć szczegóły każdej próby.' }
    case 'results_categories':
      return { topic, text: 'Wyniki według kategorii znajdziesz w panelu głównym, w sekcji „Postępy” i zakładce „Szczegóły”.', href: '/panel' }
  }
}
