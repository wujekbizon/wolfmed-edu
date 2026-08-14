import 'server-only'
import { eq } from 'drizzle-orm'
import { DELETED_ACCOUNT_AUTHOR } from '@/constants/accountDeletion'
import { blogPosts } from '@/server/db/schema'
import type { PaymentTransaction } from '@/types/dbTypes'

export async function anonymizeEditorialContent(
  tx: PaymentTransaction,
  userId: string,
  erasedUserId: string
): Promise<void> {
  await tx.update(blogPosts).set({
    authorId: erasedUserId,
    authorName: DELETED_ACCOUNT_AUTHOR,
    updatedAt: new Date(),
  }).where(eq(blogPosts.authorId, userId))
}
