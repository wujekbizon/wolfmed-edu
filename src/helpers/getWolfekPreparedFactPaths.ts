import { getWolfekPreparedOptions } from './getWolfekPreparedOptions'
import type { WolfekPack, WolfekQuestionRequest } from '@/types/wolfekResponseTypes'

export function getWolfekPreparedFactPaths(input: WolfekQuestionRequest, pack: WolfekPack) {
  const paths = getWolfekPreparedOptions(input, pack).flatMap(option => [
    ...option.requiredFacts,
    ...option.conditions.map(condition => condition.path),
    ...Array.from(option.template.matchAll(/\{\{([a-zA-Z0-9_.]+)\}\}/g), match => match[1]!),
  ])
  return new Set(paths)
}
