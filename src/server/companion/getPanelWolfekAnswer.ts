import 'server-only'
import { careerPathsData } from '@/constants/careerPathsData'
import { formatBytes } from '@/helpers/formatBytes'
import { getCurrentUser } from '@/server/user'
import { getQuestionAccuracyAnalytics, getUserBadges, getUserStorageUsage } from '@/server/queries'
import { getPlanProgress } from '@/server/planner/progress'
import { getBillingOverview } from '@/server/payments/getBillingOverview'
import { getPanelCountdownAnswer } from './getPanelCountdownAnswer'
import type { PanelWolfekAnswer, PanelWolfekContext, PanelWolfekTopic } from '@/types/panelWolfekTypes'

export async function getPanelWolfekAnswer(
  userId: string, topic: PanelWolfekTopic, context: PanelWolfekContext,
): Promise<PanelWolfekAnswer> {
  let text = ''
  let href: string | undefined
  switch (topic) {
    case 'first_steps':
      text = 'To Twój panel główny. U góry widzisz wyniki, niżej skróty do nauki i kursów. Po prawej są Twoje kursy, pierwsze kroki i odliczanie. Niżej znajdziesz szczegóły postępów, odznaki i płatności.'
      break
    case 'username':
      text = 'Nazwę użytkownika zmienisz w formularzu „Nazwa użytkownika” niżej na tej stronie. Wpisz nową nazwę i wybierz „Aktualizuj nazwę”.'
      break
    case 'motto':
      text = 'Motto zmienisz w formularzu „Motto nauki” niżej na tej stronie. Wpisz tekst i wybierz „Ustaw motto”.'
      break
    case 'courses': {
      const names = context.courses.map((course) =>
        `${careerPathsData[course.slug]?.title ?? course.slug} (${course.tier})`)
      text = `Masz dostęp do: ${names.join(', ')}. Szczegóły swoich kursów zobaczysz w sekcji „Twoje kursy” lub na stronie „Moje kursy”.`
      href = '/panel/kursy'
      break
    }
    case 'countdown':
      return getPanelCountdownAnswer(userId, context)
    case 'results': {
      const user = await getCurrentUser()
      text = user
        ? `W testach rozwiązano ${user.totalQuestions} pytań w ${user.testsAttempted} próbach. Poprawnych odpowiedzi: ${user.totalScore}. Szczegóły i wykres z ostatnich 30 dni są w sekcji „Postępy”.`
        : 'Szczegóły wyników znajdziesz w sekcji „Postępy”.'
      break
    }
    case 'difficult_questions': {
      const questions = await getQuestionAccuracyAnalytics(userId)
      text = questions.length
        ? `Masz ${questions.length} problematycznych pytań. Otwórz zakładkę „Szczegóły” w sekcji postępów, aby je przejrzeć.`
        : 'Nie masz teraz pytań z dokładnością poniżej 50%. Gdy takie się pojawią, znajdziesz je w zakładce „Szczegóły” postępów.'
      break
    }
    case 'plan': {
      const plan = await getPlanProgress(userId)
      text = plan
        ? `Plan „${plan.plan.name}”: ${plan.daysLeft} dni do końca. Zrealizowano ${plan.attributedMinutes} z ${plan.plannedTotalMinutes} zaplanowanych minut. Dzisiejsze zadania znajdziesz w planie.`
        : 'Nie masz aktywnego planu. Wybierz „Stwórz plan nauki” w panelu, aby ustalić cel i termin.'
      href = '/panel/plan'
      break
    }
    case 'billing': {
      const billing = await getBillingOverview(userId)
      text = billing.subscriptions.length
        ? 'Status i terminy subskrypcji zobaczysz w „Plan i płatności”. Aby ją zmienić lub anulować, wybierz tam „Zarządzaj subskrypcją”.'
        : 'W sekcji „Plan i płatności” sprawdzisz swoje zakupy. Jeśli masz tylko dostęp na zawsze, nie ma subskrypcji do anulowania.'
      break
    }
    case 'storage': {
      const usage = await getUserStorageUsage(userId)
      text = `Wykorzystujesz ${formatBytes(usage.storageUsed)} z ${formatBytes(usage.storageLimit)} miejsca. Szczegóły są w „Miejsce na dysku”.`
      break
    }
    case 'badges': {
      const badges = await getUserBadges(userId)
      text = `Masz ${badges.length} odznak. Zobacz je w sekcji „Zdobyte odznaki”. Nowe zdobywasz przez wyzwania procedur.`
      break
    }
    case 'navigation':
      text = 'W „Co oferuje platforma” znajdziesz testy, naukę, procedury i wykłady. Dostępność opcji zależy od kursu i planu.'
      break
    case 'forum':
      text = 'Sekcja „Forum” pokazuje ostatnią aktywność i powiadomienia. Wybierz „Dołącz do dyskusji”, aby przejść na forum.'
      href = '/forum'
      break
    case 'feedback':
      text = 'Niżej na stronie znajdziesz formularz opinii. Wpisz treść, wybierz ocenę i samodzielnie ją wyślij.'
  }
  return href ? { topic, text, href } : { topic, text }
}
