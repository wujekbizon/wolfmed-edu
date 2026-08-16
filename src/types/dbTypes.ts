import type { db } from '@/server/db/index'

export type PaymentTransaction = Pick<
  typeof db,
  'delete' | 'execute' | 'insert' | 'select' | 'update'
>
