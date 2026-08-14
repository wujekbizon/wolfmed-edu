import type postgres from 'postgres'

export async function cleanupBillingOrphans(
  tx: postgres.TransactionSql
): Promise<void> {
  await tx.unsafe(`
    UPDATE wolfmed_stripe_payments payments
    SET "userId" = NULL, order_id = NULL, "customerEmail" = NULL,
        "stripeCustomerId" = NULL, pseudonymized_at = now(),
        retention_until = date_trunc('year', COALESCE("createdAt", now()))
          + interval '7 years' - interval '1 millisecond'
    WHERE "userId" IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM wolfmed_users users
      WHERE users."userId" = payments."userId"
    )
  `)
  await tx.unsafe(`
    UPDATE wolfmed_stripe_subscriptions subscriptions
    SET "userId" = NULL, order_id = NULL, "customerEmail" = NULL,
        owner_deleted_at = now(), cleanup_after = now() + interval '30 days'
    WHERE "userId" IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM wolfmed_users users
      WHERE users."userId" = subscriptions."userId"
    )
  `)
  await tx.unsafe(`
    UPDATE wolfmed_processed_events events
    SET "userId" = NULL, order_id = NULL, payment_id = NULL,
        subscription_record_id = NULL, owner_deleted_at = now(),
        cleanup_after = now() + interval '30 days'
    WHERE "userId" IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM wolfmed_users users
      WHERE users."userId" = events."userId"
    )
  `)
  await tx.unsafe(`
    UPDATE wolfmed_stripe_checkout_orders orders
    SET user_id = NULL, deduplication_key = NULL, owner_deleted_at = now(),
        cleanup_after = now() + interval '30 days', updated_at = now()
    WHERE user_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM wolfmed_users users
      WHERE users."userId" = orders.user_id
    )
  `)
}
