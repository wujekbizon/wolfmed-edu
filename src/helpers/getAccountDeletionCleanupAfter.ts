import { ACCOUNT_DELETION_OPERATIONAL_DAYS } from '@/constants/accountDeletion'

export function getAccountDeletionCleanupAfter(deletedAt: Date): Date {
  const cleanupAfter = new Date(deletedAt)
  cleanupAfter.setUTCDate(
    cleanupAfter.getUTCDate() + ACCOUNT_DELETION_OPERATIONAL_DAYS
  )
  return cleanupAfter
}
