import type { db } from '@/server/db/index'

export type PaymentTransaction = Pick<
  typeof db,
  'delete' | 'insert' | 'select' | 'update'
>
