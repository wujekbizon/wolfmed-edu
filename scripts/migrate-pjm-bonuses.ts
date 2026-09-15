import postgres from 'postgres'
import { getPjmBonusGrant } from '../src/helpers/getPjmBonusGrant'
import type { PjmBonusGrant, PjmBonusSource } from '../src/types/pjmBonusTypes'

const args = process.argv.slice(2)
if (
  args.some((arg) => !['--dry-run', '--apply'].includes(arg)) ||
  (args.includes('--dry-run') && args.includes('--apply'))
) {
  throw new Error('Use --dry-run or --apply')
}

const apply = args.includes('--apply')
const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) throw new Error('NEON_DATABASE_URL is not set')

const sql = postgres(connectionString, { ssl: 'require', max: 1 })

async function migratePjmBonuses() {
  await sql.begin(async (tx) => {
    const [course] = await tx`
      SELECT slug FROM wolfmed_courses
      WHERE slug = 'jezyk-migowy' AND is_active = true
    `
    if (!course) throw new Error('Active jezyk-migowy course is required')

    const sources = await tx<PjmBonusSource & { id: string }[]>`
      SELECT id, "userId", course_slug AS "courseSlug", access_tier AS "accessTier",
        source_type AS "sourceType", source_id AS "sourceId", is_active AS "isActive",
        enrolled_at AS "enrolledAt", starts_at AS "startsAt",
        expires_at AS "expiresAt", revoked_at AS "revokedAt"
      FROM wolfmed_course_enrollments
      WHERE course_slug IN ('opiekun-medyczny', 'pielegniarstwo')
        AND access_tier IN ('basic', 'premium') AND is_active = true
        AND (source_type IS NULL OR source_type IN (
          'legacy_lifetime', 'lifetime_purchase', 'lifetime_upgrade', 'subscription', 'manual'
        ))
      ${apply ? tx`FOR UPDATE` : tx``}
    `

    const now = new Date()
    const candidates = sources
      .map((source) => ({
        source,
        bonus: getPjmBonusGrant({
          ...source,
          sourceType: source.sourceType ?? 'legacy_lifetime',
          sourceId: source.sourceId ?? source.id,
        }, now),
      }))
      .filter((candidate): candidate is { source: PjmBonusSource & { id: string }; bonus: PjmBonusGrant } =>
        candidate.bonus?.isActive === true
      )

    const existing = await tx<{ sourceId: string }[]>`
      SELECT source_id AS "sourceId" FROM wolfmed_course_enrollments
      WHERE course_slug = 'jezyk-migowy' AND source_type = 'premium_bundle'
        AND source_id LIKE 'jezyk-migowy:%'
    `
    const existingIds = new Set(existing.map((row) => row.sourceId))
    const missing = candidates.filter(({ bonus }) => !existingIds.has(bonus.sourceId))
    let inserted = 0

    if (apply) {
      for (const { source, bonus } of missing) {
        const rows = await tx`
          INSERT INTO wolfmed_course_enrollments (
            "userId", course_slug, access_tier, source_type, source_id,
            is_active, enrolled_at, starts_at, expires_at, revoked_at
          )
          SELECT ${bonus.userId}, ${bonus.courseSlug}, ${bonus.accessTier},
            ${bonus.sourceType}, ${bonus.sourceId}, true, parent.enrolled_at,
            CASE WHEN parent.source_type = 'subscription' THEN NULL ELSE parent.starts_at END,
            parent.expires_at, NULL
          FROM wolfmed_course_enrollments parent
          WHERE parent.id = ${source.id}
          ON CONFLICT (source_type, source_id) DO NOTHING
          RETURNING id
        `
        inserted += rows.length
      }
    }

    console.log(JSON.stringify({
      mode: apply ? 'apply' : 'dry-run',
      eligibleUsers: new Set(candidates.map(({ bonus }) => bonus.userId)).size,
      eligibleGrants: candidates.length,
      existing: candidates.length - missing.length,
      missing: missing.length,
      inserted,
    }))
  })
}

migratePjmBonuses()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => sql.end())
