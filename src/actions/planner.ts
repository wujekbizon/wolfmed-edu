'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { eq, and, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import {
  learningPlans,
  learningPlanConcepts,
  studyLogs,
} from '@/server/db/schema'
import {
  AddConceptSchema,
  ConceptIdSchema,
  CreatePlanSchema,
  LogStudySchema,
  PlanIdSchema,
  UpdatePlanSchema,
} from '@/server/schema'
import {
  getActivePlan,
  getConceptById,
  getPlanById,
  getUserEnrolledCourses,
} from '@/server/queries'
import { checkRateLimit } from '@/lib/rateLimit'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { onStudyLogRecorded } from '@/server/memory/extractStudyLog'

const PLANNER_PATHS = ['/panel/plan', '/panel']

function revalidatePlanner() {
  PLANNER_PATHS.forEach((path) => revalidatePath(path))
}

function rateLimitMessage(reset: number) {
  const resetMinutes = Math.ceil((reset - Date.now()) / 60000)
  return `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
}

export async function createPlanAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const rateLimit = await checkRateLimit(userId, 'planner:create')
  if (!rateLimit.success) {
    return toFormState('ERROR', rateLimitMessage(rateLimit.reset))
  }

  let parsed
  try {
    parsed = CreatePlanSchema.parse({
      courseSlug: formData.get('courseSlug'),
      name: formData.get('name'),
      goalType: formData.get('goalType'),
      focusCategoryKey: (formData.get('focusCategoryKey') as string) || null,
      dueDate: formData.get('dueDate'),
      minutesPerDay: formData.get('minutesPerDay'),
      studyDays: JSON.parse((formData.get('studyDays') as string) || '[]'),
      concepts: JSON.parse((formData.get('concepts') as string) || '[]'),
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  try {
    const existingPlan = await getActivePlan(userId)
    if (existingPlan) {
      return toFormState(
        'ERROR',
        'Masz już aktywny plan nauki. Zakończ go lub zarchiwizuj, aby utworzyć nowy.'
      )
    }

    const enrolledCourses = await getUserEnrolledCourses(userId)
    const isEnrolled = enrolledCourses.some(
      (course) => course.slug === parsed.courseSlug
    )
    if (!isEnrolled) {
      return toFormState('ERROR', 'Nie masz dostępu do tego kursu.')
    }

    await db.transaction(async (tx) => {
      const [plan] = await tx
        .insert(learningPlans)
        .values({
          userId,
          courseSlug: parsed.courseSlug,
          name: parsed.name,
          goalType: parsed.goalType,
          focusCategoryKey: parsed.focusCategoryKey || null,
          dueDate: parsed.dueDate,
          minutesPerDay: parsed.minutesPerDay,
          studyDays: parsed.studyDays,
        })
        .returning({ id: learningPlans.id })

      if (!plan) throw new Error('Nie udało się utworzyć planu.')

      await tx.insert(learningPlanConcepts).values(
        parsed.concepts.map((concept, index) => ({
          planId: plan.id,
          userId,
          categoryKey: concept.categoryKey || null,
          procedureId: concept.procedureId || null,
          label: concept.label,
          source: concept.source,
          targetMinutes: concept.targetMinutes,
          sortOrder: index,
        }))
      )
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePlanner()
  return toFormState('SUCCESS', 'Plan nauki został utworzony!')
}

export async function updatePlanAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const rateLimit = await checkRateLimit(userId, 'planner:update')
  if (!rateLimit.success) {
    return toFormState('ERROR', rateLimitMessage(rateLimit.reset))
  }

  let parsed
  try {
    parsed = UpdatePlanSchema.parse({
      planId: formData.get('planId'),
      name: formData.get('name'),
      dueDate: formData.get('dueDate'),
      minutesPerDay: formData.get('minutesPerDay'),
      studyDays: JSON.parse((formData.get('studyDays') as string) || '[]'),
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  try {
    const plan = await getPlanById(parsed.planId)
    if (!plan || plan.userId !== userId) {
      return toFormState('ERROR', 'Nie znaleziono planu.')
    }

    await db
      .update(learningPlans)
      .set({
        name: parsed.name,
        dueDate: parsed.dueDate,
        minutesPerDay: parsed.minutesPerDay,
        studyDays: parsed.studyDays,
        updatedAt: new Date(),
      })
      .where(
        and(eq(learningPlans.id, parsed.planId), eq(learningPlans.userId, userId))
      )
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePlanner()
  return toFormState('SUCCESS', 'Plan został zaktualizowany.')
}

async function setPlanStatus(
  userId: string,
  formData: FormData,
  status: 'completed' | 'archived',
  successMessage: string
): Promise<FormState> {
  let parsed
  try {
    parsed = PlanIdSchema.parse({ planId: formData.get('planId') })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  try {
    const plan = await getPlanById(parsed.planId)
    if (!plan || plan.userId !== userId) {
      return toFormState('ERROR', 'Nie znaleziono planu.')
    }

    await db
      .update(learningPlans)
      .set({ status, updatedAt: new Date() })
      .where(
        and(eq(learningPlans.id, parsed.planId), eq(learningPlans.userId, userId))
      )
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePlanner()
  return toFormState('SUCCESS', successMessage)
}

export async function archivePlanAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const rateLimit = await checkRateLimit(userId, 'planner:update')
  if (!rateLimit.success) {
    return toFormState('ERROR', rateLimitMessage(rateLimit.reset))
  }

  return setPlanStatus(userId, formData, 'archived', 'Plan został zarchiwizowany.')
}

export async function completePlanAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const rateLimit = await checkRateLimit(userId, 'planner:update')
  if (!rateLimit.success) {
    return toFormState('ERROR', rateLimitMessage(rateLimit.reset))
  }

  return setPlanStatus(
    userId,
    formData,
    'completed',
    'Gratulacje! Plan został ukończony. 🎉'
  )
}

export async function toggleConceptAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const rateLimit = await checkRateLimit(userId, 'planner:update')
  if (!rateLimit.success) {
    return toFormState('ERROR', rateLimitMessage(rateLimit.reset))
  }

  let parsed
  try {
    parsed = ConceptIdSchema.parse({ conceptId: formData.get('conceptId') })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  try {
    const concept = await getConceptById(parsed.conceptId)
    if (!concept || concept.userId !== userId) {
      return toFormState('ERROR', 'Nie znaleziono zagadnienia.')
    }

    const nowDone = !concept.completedAt
    await db
      .update(learningPlanConcepts)
      .set({ completedAt: nowDone ? new Date() : null })
      .where(
        and(
          eq(learningPlanConcepts.id, parsed.conceptId),
          eq(learningPlanConcepts.userId, userId)
        )
      )

    revalidatePlanner()
    return toFormState(
      'SUCCESS',
      nowDone ? 'Zagadnienie ukończone! 💪' : 'Zagadnienie oznaczone jako nieukończone.'
    )
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

export async function addConceptAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const rateLimit = await checkRateLimit(userId, 'planner:update')
  if (!rateLimit.success) {
    return toFormState('ERROR', rateLimitMessage(rateLimit.reset))
  }

  let parsed
  try {
    parsed = AddConceptSchema.parse({
      planId: formData.get('planId'),
      label: formData.get('label'),
      categoryKey: formData.get('categoryKey') || null,
      targetMinutes: formData.get('targetMinutes'),
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  try {
    const plan = await getPlanById(parsed.planId)
    if (!plan || plan.userId !== userId) {
      return toFormState('ERROR', 'Nie znaleziono planu.')
    }

    const [{ maxOrder }] = (await db
      .select({
        maxOrder: sql<number>`coalesce(max(${learningPlanConcepts.sortOrder}), -1)`,
      })
      .from(learningPlanConcepts)
      .where(eq(learningPlanConcepts.planId, parsed.planId))) as [
      { maxOrder: number }
    ]

    await db.insert(learningPlanConcepts).values({
      planId: parsed.planId,
      userId,
      categoryKey: parsed.categoryKey || null,
      label: parsed.label,
      source: parsed.categoryKey ? 'category' : 'custom',
      targetMinutes: parsed.targetMinutes,
      sortOrder: maxOrder + 1,
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePlanner()
  return toFormState('SUCCESS', 'Zagadnienie dodane do planu.')
}

export async function removeConceptAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const rateLimit = await checkRateLimit(userId, 'planner:update')
  if (!rateLimit.success) {
    return toFormState('ERROR', rateLimitMessage(rateLimit.reset))
  }

  let parsed
  try {
    parsed = ConceptIdSchema.parse({ conceptId: formData.get('conceptId') })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  try {
    const concept = await getConceptById(parsed.conceptId)
    if (!concept || concept.userId !== userId) {
      return toFormState('ERROR', 'Nie znaleziono zagadnienia.')
    }

    await db
      .delete(learningPlanConcepts)
      .where(
        and(
          eq(learningPlanConcepts.id, parsed.conceptId),
          eq(learningPlanConcepts.userId, userId)
        )
      )
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePlanner()
  return toFormState('SUCCESS', 'Zagadnienie usunięte z planu.')
}

export async function logStudySessionAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const rateLimit = await checkRateLimit(userId, 'planner:log')
  if (!rateLimit.success) {
    return toFormState('ERROR', rateLimitMessage(rateLimit.reset))
  }

  let parsed
  try {
    parsed = LogStudySchema.parse({
      minutes: formData.get('minutes'),
      note: (formData.get('note') as string) || undefined,
      conceptId: (formData.get('conceptId') as string) || null,
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  try {
    const plan = await getActivePlan(userId)

    if (parsed.conceptId) {
      const concept = await getConceptById(parsed.conceptId)
      if (!concept || concept.userId !== userId) {
        return toFormState('ERROR', 'Nie znaleziono zagadnienia.')
      }
    }

    const [studyLog] = await db
      .insert(studyLogs)
      .values({
        userId,
        planId: plan?.id ?? null,
        conceptId: parsed.conceptId || null,
        minutes: parsed.minutes,
        note: parsed.note || null,
        source: 'manual',
      })
      .returning({ id: studyLogs.id })
    after(() => onStudyLogRecorded({ userId, studyLogId: studyLog!.id }))
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePlanner()
  return toFormState('SUCCESS', 'Nauka zapisana. Tak trzymaj! 🔥')
}
