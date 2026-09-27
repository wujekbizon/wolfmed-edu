'use server'

import { PracticeSupportSchema } from '@/server/schema'
import { requireCategoryAccess } from '@/server/learning/requireCategoryAccess'
import { isPracticeEnabled } from '@/server/learning/config'
import { getJevConfig } from '@/server/learning/jevConfig'
import { preparePracticeSupport } from '@/server/learning/prepareSupport'
import { reserveJevBudget } from '@/server/learning/reserveJevBudget'
import { selectJevSupport } from '@/server/learning/decisionClient'
import { savePracticeSupport } from '@/server/learning/saveSupport'
import { checkRateLimit } from '@/lib/rateLimit'

export async function selectPracticeSupportAction(input: unknown) {
  try {
    const request = PracticeSupportSchema.parse(input)
    const userId = await requireCategoryAccess(request.category)
    const config = getJevConfig()
    if (!isPracticeEnabled(request.category) || !config) return null
    const rate = await checkRateLimit(userId, 'practice:support')
    if (!rate.success) return null
    const context = await preparePracticeSupport(userId, request)
    if (!context) return null
    if (!context.candidates.length) return await savePracticeSupport(userId, context, config, null, 0)
    if (!await reserveJevBudget(config, request.sessionId, context.trigger)) return null
    const start = Date.now()
    const decision = await selectJevSupport(config.apiKey, context.state, context.candidates)
    await requireCategoryAccess(request.category)
    if (!isPracticeEnabled(request.category)) return null
    return await savePracticeSupport(userId, context, config, decision, Date.now() - start)
  } catch {
    return null
  }
}
