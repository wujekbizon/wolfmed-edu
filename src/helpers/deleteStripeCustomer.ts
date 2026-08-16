import { isMissingStripeCustomer } from '@/helpers/isMissingStripeCustomer'

type DeleteCustomer = (customerId: string) => Promise<unknown>

export async function deleteStripeCustomer(
  customerId: string | null,
  deleteCustomer: DeleteCustomer
): Promise<void> {
  if (!customerId) return

  try {
    await deleteCustomer(customerId)
  } catch (error) {
    if (!isMissingStripeCustomer(error)) throw error
  }
}
