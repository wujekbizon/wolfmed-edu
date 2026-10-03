import 'server-only'
import { careerPathsData } from '@/constants/careerPathsData'
import { KIERUNKI_WOLFEK_VIDEOS } from '@/constants/kierunkiWolfekVideos'
import type { KierunkiWolfekContext } from '@/types/kierunkiWolfekTypes'

export function getWolfekCatalogFacts(context: KierunkiWolfekContext) {
  const catalog = Object.fromEntries(context.catalog.map((course) => {
    const path = careerPathsData[course.slug]
    const basic = path?.pricing?.basic.features.filter((item) => !/^Ponad |^[0-9]/.test(item)) ?? []
    const premium = path?.pricing?.premium?.features.filter((item) => !item.startsWith('Wszystko z planu')) ?? []
    const available = course.offers.filter((offer) => offer.available)
    const key = course.slug === 'opiekun-medyczny' ? 'opiekun' : course.slug === 'pielegniarstwo' ? 'nursing' : 'english'
    return [key, { title: course.title, basicFeaturesText: basic.join('; '),
      premiumFeaturesText: available.some((offer) => offer.tier === 'premium') ? premium.join('; ') : 'Premium nie jest obecnie dostępne.',
      offersText: available.map((offer) => `${offer.tier} ${offer.price}${offer.model === 'subscription' ? ' / miesiąc' : ' jednorazowo'}`).join('; ') || 'Brak dostępnych ofert.',
      descriptionText: path?.description ?? course.title,
      availabilityText: 'Dostępność wynika z konfiguracji ofert; płatność potwierdza formularz zakupu.' }]
  }))
  const videos = Object.fromEntries(context.catalog.map((course) => {
    const key = course.slug === 'opiekun-medyczny' ? 'opiekun' : course.slug === 'pielegniarstwo' ? 'nursing' : 'english'
    const video = KIERUNKI_WOLFEK_VIDEOS[course.slug]
    return [key, { status: video ? 'available' : 'unavailable', title: video?.title ?? null, requestedCourseTitle: course.title }]
  }))
  return { catalog,
    payments: { subscriptionTermsText: 'opłacasz wybrany wariant co miesiąc',
      lifetimeTermsText: 'opłacasz wybrany wariant jednorazowo',
      subscriptionCardSupported: null, subscriptionMethodsText: null },
    video: { courses: videos } }
}
