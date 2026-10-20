import { auth } from '@clerk/nextjs/server'
import { PracticeCategorySchema } from '@/server/schema'
import { requireCategoryAccess } from '@/server/learning/requireCategoryAccess'
import { isPracticeEnabled } from '@/server/learning/config'
import { readPracticeSession } from '@/server/learning/readSession'
import { PracticeError } from '@/server/learning/PracticeError'

export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' }
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ message: 'Zaloguj się ponownie.' }, { status: 401, headers })
    const params = new URL(request.url).searchParams
    if (params.get('userId') !== userId) {
      return Response.json({ message: 'Zaloguj się ponownie.' }, { status: 401, headers })
    }
    const category = PracticeCategorySchema.safeParse(params.get('category'))
    if (!category.success) {
      return Response.json({ message: 'Nieprawidłowa kategoria.' }, { status: 400, headers })
    }
    await requireCategoryAccess(category.data)
    if (!isPracticeEnabled(category.data)) {
      return Response.json({ message: 'Ćwiczenia są obecnie niedostępne.' }, { status: 403, headers })
    }
    return Response.json(await readPracticeSession(userId, category.data), { headers })
  } catch (error) {
    if (error instanceof PracticeError) {
      return Response.json({ message: error.message }, { status: 403, headers })
    }
    console.error('[practice] Progress refresh failed', error)
    return Response.json({ message: 'Nie udało się odświeżyć postępu.' }, { status: 500, headers })
  }
}
