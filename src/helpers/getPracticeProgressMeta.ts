import { PracticeProgressMetaSchema } from '@/server/schema'

export function getPracticeProgressMeta(meta: unknown) {
  return PracticeProgressMetaSchema.parse(meta ?? {})
}
