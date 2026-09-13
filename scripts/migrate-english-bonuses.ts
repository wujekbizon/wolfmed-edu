import postgres from 'postgres'
import { getEnglishBonusGrant } from '../src/helpers/getEnglishBonusGrant'
import type { EnglishBonusGrant, EnglishBonusMigrationSource } from '../src/types/englishBonusTypes'

const args = process.argv.slice(2)
if (args.some((arg) => !['--dry-run', '--apply'].includes(arg)) ||
  (args.includes('--dry-run') && args.includes('--apply'))) {
  throw new Error('Use --dry-run or --apply')
}
const apply = args.includes('--apply')
const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) throw new Error('NEON_DATABASE_URL is not set')
const sql = postgres(connectionString, { ssl: 'require', max: 1 })

async function migrateEnglishBonuses() {
  await sql.begin(async (tx) => {
    const [course] = await tx`
      SELECT slug FROM wolfmed_courses
      WHERE slug = 'angielski-medyczny' AND is_active = true
    `
    if (!course) throw new Error('Active angielski-medyczny course is required')

    const sources = await tx<EnglishBonusMigrationSource[]>`
      SELECT id, "userId", course_slug AS "courseSlug", access_tier AS "accessTier",
        source_type AS "sourceType", source_id AS "sourceId", is_active AS "isActive",
        enrolled_at AS "enrolledAt", starts_at AS "startsAt",
        expires_at AS "expiresAt", revoked_at AS "revokedAt"
      FROM wolfmed_course_enrollments
      WHERE course_slug IN ('opiekun-medyczny', 'pielegniarstwo')
        AND access_tier = 'premium' AND is_active = true
        AND (source_type IS NULL OR source_type IN (
          'legacy_lifetime', 'lifetime_purchase', 'lifetime_upgrade', 'subscription', 'manual'
        ))
      ${apply ? tx`FOR UPDATE` : tx``}
    `
    const now = new Date()
    const candidates = sources.map((source) => ({
      source,
      bonus: getEnglishBonusGrant({
        ...source,
        sourceType: source.sourceType ?? 'legacy_lifetime',
        sourceId: source.sourceId ?? source.id,
      }, now),
    })).filter((candidate): candidate is { source: EnglishBonusMigrationSource; bonus: EnglishBonusGrant } =>
      candidate.bonus?.isActive === true
    )
    const bonuses = candidates.map((candidate) => candidate.bonus)
    const existing = await tx<{ sourceId: string }[]>`
      SELECT source_id AS "sourceId" FROM wolfmed_course_enrollments
      WHERE source_type = 'premium_bundle'
    `
    const existingIds = new Set(existing.map((row) => row.sourceId))
    const missing = candidates.filter(({ bonus }) => !existingIds.has(bonus.sourceId))
    let inserted = 0
    let repaired = 0
    if (apply) {
      const repairedRows = await tx`
        WITH parents AS (
          SELECT bonus.id, parent.enrolled_at, parent.expires_at,
            CASE WHEN bonus.source_id LIKE 'subscription:%' THEN NULL
              ELSE parent.starts_at END AS starts_at
          FROM wolfmed_course_enrollments bonus
          JOIN wolfmed_course_enrollments parent
            ON parent."userId" = bonus."userId"
            AND (
              (split_part(bonus.source_id, ':', 1) = parent.source_type
                AND substring(bonus.source_id FROM position(':' IN bonus.source_id) + 1) = parent.source_id)
              OR (split_part(bonus.source_id, ':', 1) = 'legacy_lifetime'
                AND parent.source_type IS NULL
                AND substring(bonus.source_id FROM position(':' IN bonus.source_id) + 1) = parent.id::text)
            )
          WHERE bonus.source_type = 'premium_bundle'
            AND parent.course_slug IN ('opiekun-medyczny', 'pielegniarstwo')
            AND parent.access_tier = 'premium'
            AND parent.is_active = true
            AND parent.revoked_at IS NULL
        )
        UPDATE wolfmed_course_enrollments bonus
        SET enrolled_at = parents.enrolled_at,
          starts_at = parents.starts_at,
          expires_at = parents.expires_at
        FROM parents
        WHERE bonus.id = parents.id
        RETURNING bonus.id
      `
      repaired = repairedRows.length
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
          ON CONFLICT (source_type, source_id) DO NOTHING RETURNING id
        `
        inserted += rows.length
      }
    }
    console.log(JSON.stringify({
      mode: apply ? 'apply' : 'dry-run',
      eligibleUsers: new Set(bonuses.map((bonus) => bonus.userId)).size,
      eligibleGrants: bonuses.length,
      existing: bonuses.length - missing.length,
      missing: missing.length,
      repaired,
      inserted,
    }))
  })
}

migrateEnglishBonuses().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
}).finally(() => sql.end())
