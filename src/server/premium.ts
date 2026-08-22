import 'server-only'
import { cache } from 'react'
import { checkPremiumAccessAction } from '@/actions/course-actions'

/**
 * Request-scoped premium check.
 *
 * The nauka page renders several independent Suspense boundaries that each need the
 * premium flag; `cache` collapses those into a single access lookup per request.
 */
export const getIsPremium = cache(async () => checkPremiumAccessAction())
