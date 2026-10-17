import type { WolfekPack } from '@/types/wolfekResponseTypes'

export function expandWolfekCourseResponses(pack: WolfekPack): WolfekPack {
  const courses = [['opiekun', 'opiekun-medyczny'], ['nursing', 'pielegniarstwo'], ['english', 'angielski-medyczny']]
  return { ...pack, options: pack.options.flatMap((option) => {
    if (!['prices', 'tiers', 'video_yes', 'video_no', 'video_unknown'].includes(option.id)) return [option]
    const video = option.id.startsWith('video_')
    const variants = courses.map(([key, slug]) => {
      const replace = (text: string) => text.replaceAll('video.', `video.courses.${key}.`)
      const template = video ? replace(option.template) : option.id === 'prices'
        ? `{{catalog.${key}.title}}: {{catalog.${key}.offersText}}. {{catalog.${key}.availabilityText}}`
        : `{{catalog.${key}.title}} — Basic: {{catalog.${key}.basicFeaturesText}}. Premium: {{catalog.${key}.premiumFeaturesText}}.`
      const requiredFacts = video ? option.requiredFacts.map(replace) : option.id === 'prices'
        ? [`catalog.${key}.title`, `catalog.${key}.offersText`, `catalog.${key}.availabilityText`]
        : [`catalog.${key}.title`, `catalog.${key}.basicFeaturesText`, `catalog.${key}.premiumFeaturesText`]
      return { ...option, id: `${option.id}_${key}`,
        covers: `${option.covers} Course: ${slug}. Do not choose this for another course.`,
        template, requiredFacts,
        conditions: option.conditions.map((condition) => ({ ...condition, path: replace(condition.path) })),
        action: option.action ? { ...option.action, destinationKey:
          option.action.type === 'video' ? `requestedCourseVideo:${slug}` : `requestedCourse:${slug}` } : null }
    })
    return video ? variants : [option, ...variants]
  }) }
}
