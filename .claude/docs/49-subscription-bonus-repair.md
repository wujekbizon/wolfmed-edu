# Repair stale subscription bonuses

Deploy the enrollment-sync fix first. Copy this SQL into Neon SQL Editor and run
the entire block. It returns repaired rows. Reruns skip already revoked bonuses.
The transaction briefly blocks enrollment writes to prevent payment-recovery races.
This query has not been executed against a database.

```sql
BEGIN;

SET LOCAL lock_timeout = '5s';
LOCK TABLE wolfmed_course_enrollments IN SHARE ROW EXCLUSIVE MODE;

UPDATE wolfmed_course_enrollments AS bonus
SET is_active = false,
    revoked_at = COALESCE(parent.revoked_at, CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
FROM wolfmed_course_enrollments AS parent
WHERE bonus.source_type = 'premium_bundle'
  AND bonus.course_slug = 'angielski-medyczny'
  AND bonus.access_tier = 'basic'
  AND parent.source_type = 'subscription'
  AND parent.course_slug IN ('opiekun-medyczny', 'pielegniarstwo')
  AND bonus."userId" = parent."userId"
  AND bonus.source_id = 'subscription:' || parent.source_id
  AND (bonus.is_active OR bonus.revoked_at IS NULL)
  AND (
    NOT parent.is_active
    OR parent.revoked_at IS NOT NULL
    OR parent.access_tier <> 'premium'
    OR parent.expires_at <= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
  )
RETURNING bonus.id, bonus."userId", bonus.source_id,
          bonus.is_active, bonus.expires_at, bonus.revoked_at;

COMMIT;
```
