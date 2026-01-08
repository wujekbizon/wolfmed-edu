// server/queries/user.ts
import { cache } from 'react'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/server/db/index'

export const getCurrentUser = cache(async () => {
  const { userId } = await auth()
  if (!userId) return null

  const user = await db.query.users.findFirst({
    where: (model, { eq }) => eq(model.userId, userId),
  })

  return user
})
