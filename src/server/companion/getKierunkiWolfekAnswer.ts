import 'server-only'
import { careerPathsData } from '@/constants/careerPathsData'
import { getKierunkiWolfekCourseAnswer } from '@/helpers/getKierunkiWolfekCourseAnswer'
import { getKierunkiWolfekPricingText } from '@/helpers/getKierunkiWolfekPricingText'
import { getKierunkiWolfekTierComparison } from '@/helpers/getKierunkiWolfekTierComparison'
import { KIERUNKI_CATALOG_ANCHOR } from '@/constants/kierunkiWolfek'
import type { KierunkiWolfekAnswer, KierunkiWolfekContext, KierunkiWolfekTopic } from '@/types/kierunkiWolfekTypes'

export function getKierunkiWolfekAnswer(
  topic: KierunkiWolfekTopic, context: KierunkiWolfekContext,
): KierunkiWolfekAnswer {
  const owned = context.visitor.ownedCourses

  switch (topic) {
    case 'exam_preparation':
      return getKierunkiWolfekCourseAnswer(topic, context, 'opiekun-medyczny', 'Przygotujesz się do egzaminu z bazą ponad 3000 pytań, testami praktycznymi, egzaminem próbnym i procedurami. Możesz uczyć się we własnym tempie i skupić na tym, czego potrzebujesz.')
    case 'opiekun_growth':
      return getKierunkiWolfekCourseAnswer(topic, context, 'opiekun-medyczny', 'Opiekun Medyczny sprawdzi się też po egzaminie: znajdziesz tu procedury, quizy, forum i blog medyczny. Premium dodaje AI i kolejne materiały, które wspierają rozwój w zawodzie.', 'tools-title')
    case 'nursing_journey':
      return getKierunkiWolfekCourseAnswer(topic, context, 'pielegniarstwo', 'Pielęgniarstwo to dłuższa ścieżka nauki: ponad 22 700 pytań z 22 kategorii, a Premium obejmuje pełne trzy lata i dodawane semestry. Do tego masz testy, plan nauki, notatki i narzędzia AI.')
    case 'course_selection':
      return { topic, text: 'Jeśli chcesz głównie ćwiczyć przed egzaminem opiekuna, wybierz Opiekuna Medycznego. Jeśli szukasz długofalowej ścieżki przez przedmioty i semestry, zobacz Pielęgniarstwo. Angielski Medyczny może uzupełnić oba kierunki.', href: `/kierunki#${KIERUNKI_CATALOG_ANCHOR}` }
    case 'pricing':
      return { topic, text: `Aktualne dostępne ceny:\n${getKierunkiWolfekPricingText(context)}`, href: `/kierunki#${KIERUNKI_CATALOG_ANCHOR}` }
    case 'payment_models':
      return { topic, text: 'Subskrypcję możesz anulować w dowolnym momencie. Dostęp zachowasz do końca opłaconego miesiąca, ale za rozpoczęty okres nie przysługuje zwrot. Przy zmianie na wyższy plan dopłacasz różnicę. Dostęp na zawsze opłacasz raz i zwykle bardziej się opłaca przy dłuższej nauce. Jeśli przygotowujesz się tylko do egzaminu, subskrypcja może wystarczyć.' }
    case 'tier_comparison':
      return { topic, text: `Najważniejsze różnice w dostępnych planach:\n${getKierunkiWolfekTierComparison(context)}`, href: `/kierunki#${KIERUNKI_CATALOG_ANCHOR}` }
    case 'english_course':
      return getKierunkiWolfekCourseAnswer(topic, context, 'angielski-medyczny', 'Angielski Medyczny to kurs A2 z terminami, komunikacją z pacjentem i wyrażeniami do pracy. Możesz kupić go osobno albo sprawdzić, czy pasuje jako dodatek do Twojego kierunku.')
    case 'owned_course':
      return owned.length
        ? { topic, text: `Masz już dostęp do: ${owned.map((course) => careerPathsData[course.slug]?.title ?? course.slug).join(', ')}. Wejdź do panelu, a pokażę Ci, co możesz tam robić.`, href: '/panel' }
        : context.visitor.signedIn
          ? { topic, text: 'Na tym koncie nie widzę jeszcze przypisanego kursu. Sprawdź katalog, a jeśli zakup był na innym koncie, zaloguj się właśnie na nie.', href: `/kierunki#${KIERUNKI_CATALOG_ANCHOR}` }
          : { topic, text: 'Zaloguj się na konto użyte przy zakupie, a sprawdzę dostęp. Jeśli dopiero wybierasz kurs, katalog jest niżej.', href: '/sign-in' }
  }
}
