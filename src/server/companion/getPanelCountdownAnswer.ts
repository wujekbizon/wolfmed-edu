import 'server-only'
import { getActivePlan } from '@/server/queries'
import { calculateTimeLeft } from '@/utils/dateUtils'
import type { PanelWolfekAnswer, PanelWolfekContext } from '@/types/panelWolfekTypes'

export async function getPanelCountdownAnswer(
  userId: string, context: PanelWolfekContext,
): Promise<PanelWolfekAnswer> {
  const plan = await getActivePlan(userId)
  if (plan) return {
    topic: 'countdown', href: '/panel/plan',
    text: `Odliczanie dotyczy planu „${plan.name}”. Twój termin: ${plan.dueDate.toLocaleDateString('pl-PL')}. Otwórz plan, aby zobaczyć dzisiejsze zadania.`,
  }
  if (context.route !== 'panel.home') return {
    topic: 'countdown', href: '/panel', text: 'Szczegóły odliczania znajdziesz w panelu głównym.',
  }
  if (context.courses.some((course) => course.slug === 'opiekun-medyczny')) {
    const period = calculateTimeLeft().currentPeriod
    return { topic: 'countdown', text: period
      ? `Licznik pokazuje: ${period.label}. Aktualne daty sesji są pod licznikiem.`
      : 'Nie ma obecnie zaplanowanej sesji w kalendarzu licznika.' }
  }
  return { topic: 'countdown', href: '/panel/plan',
    text: 'Na Twoim koncie panel zachęca do utworzenia planu nauki. Po jego utworzeniu licznik pokaże termin Twojego planu.' }
}
