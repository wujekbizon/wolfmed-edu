import 'server-only'
import { coalesceProfileProjection } from '@/helpers/coalesceProfileProjection'
import { projectPracticeActivity } from './projectPracticeActivity'

export const onPracticeActivity = coalesceProfileProjection(projectPracticeActivity)
