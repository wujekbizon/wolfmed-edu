import kierunki from '@/content/wolfek/kierunki.json'
import home from '@/content/wolfek/panel-home.json'
import results from '@/content/wolfek/panel-results.json'
import learning from '@/content/wolfek/learning-practice.json'
import { WolfekPackSchema } from '@/server/schema'
import { getWolfekPreparedQuestion } from '@/helpers/getWolfekPreparedQuestion'
import type { WolfekContext, WolfekQuestionRequest, WolfekRoute } from '@/types/wolfekResponseTypes'

export const packs = {
  kierunki: WolfekPackSchema.parse(kierunki), 'panel.home': WolfekPackSchema.parse(home),
  'panel.results': WolfekPackSchema.parse(results), 'learning.practice': WolfekPackSchema.parse(learning),
}
const course = { title: 'Kurs', basicFeaturesText: 'Basic', premiumFeaturesText: 'Premium',
  offersText: 'Ceny', descriptionText: 'Opis kursu' }
export const context: WolfekContext = {
  facts: {
    access: { signedIn: true, hasCourses: true, opiekun: { owned: false },
      ownedCoursesText: 'Opiekun', ownedCoursesWithTiersText: 'Opiekun Premium', firstStepsText: 'Wybierz kurs.' },
    catalog: { opiekun: course, nursing: course, english: course },
    payments: { subscriptionTermsText: 'Miesięcznie', lifetimeTermsText: 'Jednorazowo', subscriptionCardSupported: true },
    results: { hasTests: true, completedTestCount: 17, totalQuestions: 100, correctAnswers: 80,
      accuracyText: '80%', hasDifficult: false, reviewSummaryText: 'Powtórz pytania.', categoryPerformanceText: 'Opiekun: 80%' },
    plan: { active: false }, exam: { available: false }, billing: { summaryText: 'Premium' },
    badges: { hasBadges: false },
  },
  destinations: Object.fromEntries(['opiekunCourse', 'forum', 'nursingCourse', 'catalog', 'englishCourse',
    'ownedCourses', 'signIn', 'learning', 'plan', 'tests', 'analyticsCategories'].map((key) =>
    [key, { type: 'link', href: `/test/${key}` }])),
}

export function preparedInput(route: WolfekRoute, id: string): WolfekQuestionRequest {
  return { route, question: getWolfekPreparedQuestion(route, id)?.prompt ?? '', origin: 'prepared',
    preparedQuestionId: id, submissionId: crypto.randomUUID(), practice: null }
}
