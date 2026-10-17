# Wolfek admin workspace

The accepted plan is one navigation entry, `/admin/wolfek`, containing four layouts: Insights, Audit logs, Errors and Usage. Insights counts valid, permitted typed questions including cached results, and predefined topic-button clicks. It shows daily activity, popular topics, route breakdown and searchable question examples. Practice contributes provider usage, not ordinary question-answering activity.

Audit logs paginate provider calls and fetch one full payload only when expanded. Errors selects non-success provider statuses; low-confidence and `other` decisions are review items, not transport errors. Usage reports input/output tokens from the provider's `usage` fields, daily trends, model breakdown and all recorded totals. Missing or malformed usage remains unknown. These are application-observed totals, not TypeSafe account billing; older unlogged calls cannot be reconstructed.

Every server reader/action checks `requireAdmin`. Export handlers check admin access separately because API handlers do not inherit the admin layout. CSV/JSON downloads are private, uncached and rate-limited. Lists are server-paginated (25/page); exports include all matching retained rows, up to 5,000 rows and 16 MB, otherwise explicitly reject and ask for narrower filters. CSV cells neutralize spreadsheet formulas. Search/status filter the list and its export; charts use date/source filters. Days use Europe/Warsaw.

Raw interactions expire after 30 days and cascade when a user is deleted. Daily counters contain no user IDs or question text and persist beyond raw-log deletion. Audit writes and usage increments are transactional. The `usage_aggregated` flag ensures backfill only accounts for each retained provider log once; rerunning the migration does not duplicate usage. Cached questions and button clicks never add provider tokens.

Before deploying this workspace, run the prepared migration on the intended database:

```powershell
pnpm exec tsx --env-file=.env scripts/migrate-wolfek-metrics.ts --apply
```

This assumes the earlier Jev audit-table migration has been applied. This task did not run database migrations or a live provider call. The cleanup script now deletes expired interaction rows as well as provider logs; schedule it daily after applying the metrics migration:

```powershell
pnpm exec tsx --env-file=.env scripts/prune-jev-audit-logs.ts --apply
```

Components live in `src/components/admin/wolfek`; queries in `src/server/wolfek-admin`; DTOs in `src/types/wolfekAdminTypes.ts` and `wolfekAdminMetricTypes.ts`; settings in `src/constants/wolfekAdmin.ts`. React Query scopes caches to the admin user and validated filters. Raw JSON is displayed as text and is never injected as HTML. No additional Jev inference is used to produce reports.
