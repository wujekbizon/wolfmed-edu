import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import 'server-only'
import { careerPathsData } from '@/constants/careerPathsData'
import { getKierunkiWolfekContext } from './getKierunkiWolfekContext'
import { getWolfekCatalogFacts } from './getWolfekCatalogFacts'
import { getWolfekDestinations } from './getWolfekDestinations'
import { getWolfekTestFacts } from './getWolfekTestFacts'
import { getWolfekHomeFacts } from './getWolfekHomeFacts'
import type { WolfekContext, WolfekRoute } from '@/types/wolfekResponseTypes'

export async function getWolfekAppContext(userId: string | null, route: WolfekRoute): Promise<WolfekContext> {
  const context = await getKierunkiWolfekContext(userId)
  const owned = context.visitor.ownedCourses
  if (route !== 'kierunki' && (!userId || !owned.length)) throw new WolfekQuestionError('Brak dostępu do panelu.')
  const opiekun = owned.find((course) => course.slug === 'opiekun-medyczny')
  const facts = {
    access: { signedIn: Boolean(userId), hasCourses: owned.length > 0,
      ownedCoursesText: owned.map((course) => careerPathsData[course.slug]?.title ?? course.slug).join(', '),
      ownedCoursesWithTiersText: owned.map((course) => `${careerPathsData[course.slug]?.title ?? course.slug} (${course.tier})`).join(', '),
      opiekun: { owned: Boolean(opiekun),
        examFeaturesText: opiekun ? careerPathsData['opiekun-medyczny']?.pricing?.basic.features.filter((item) => !item.startsWith('Ponad')).join('; ') : null,
        growthFeaturesText: opiekun ? careerPathsData['opiekun-medyczny']?.pricing?.[opiekun.tier === 'premium' || opiekun.tier === 'pro' ? 'premium' : 'basic']?.features.join('; ') : null },
      firstStepsText: 'Wybierz kategorię w posiadanym kursie i rozpocznij naukę.',
    },
  }
  if (route === 'kierunki') return { facts: { ...facts, ...getWolfekCatalogFacts(context) }, destinations: getWolfekDestinations() }
  const [tests, home] = await Promise.allSettled([
    getWolfekTestFacts(userId!), route === 'panel.home' ? getWolfekHomeFacts(userId!, Boolean(opiekun)) : Promise.resolve({}),
  ])
  return { facts: { ...facts, results: tests.status === 'fulfilled' ? tests.value : {},
    ...(home.status === 'fulfilled' ? home.value : {}), selectedTest: { identified: false } },
    destinations: getWolfekDestinations() }
}
