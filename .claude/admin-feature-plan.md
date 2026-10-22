# Admin feature plan

## Wolfek/Jev logging switch

Status: planned. Only the default-off code constant is implemented.

Current behavior:
- `WOLFEK_ADMIN_LOGGING_ENABLED = false` in `src/constants/wolfekAdmin.ts` disables logging. Changing it requires a rebuild/deployment; it is not an environment variable.
- All three logging entrypoints check the constant before work; no DB/Redis setting lookup.
- Off skips provider audit insertion/usage aggregation, interaction insertion/aggregation and delivery-log updates before any write/transaction or payload serialization.
- Historical logs/reports remain readable; no new admin metrics are collected while off. Missing periods cannot be reconstructed from these logs.
- Provider requests, authorization, quotas, deduplication, learning progress and mandatory submission completion remain operational.

Deferred implementation:
- [ ] Add a logging switch and clear enabled/disabled status in `/admin/wolfek`.
- [ ] Protect reads/mutations with `requireAdmin`; validate changes server-side with Zod and follow the existing form pattern.
- [ ] Use shared durable configuration so the switch applies across Vercel instances; never mutate `process.env` as a runtime setting.
- [ ] Define default-off behavior and a bounded cache/invalidation strategy without adding a DB query per logging call; replace the code constant with the approved runtime setting when the switch is implemented.
- [ ] Display collection-disabled periods clearly; historical usage is recorded coverage, not complete provider billing.
- [ ] Before enabling for normal traffic, evaluate F07's awaited logging cost; consolidate writes and consider bounded background delivery where appropriate.
- [ ] Propose tests for unauthorized changes, default-off/enable/disable, instance consistency, invalidation and zero optional logging writes while disabled. Obtain approval before writing/running them.

Relevant files:
- `src/constants/wolfekAdmin.ts`: default-off logging constant, replacement point for future settings.
- `src/server/jev/writeJevAuditLog.ts`: provider audit + daily usage transaction.
- `src/server/jev/recordWolfekInteraction.ts`: interactions + daily activity transaction.
- `src/server/jev/completeWolfekAudit.ts`: delivery details update.
- `src/server/jev/addWolfekDailyMetric.ts`: aggregates, called only inside the guarded logging transactions.
- `src/actions/wolfek-admin.ts`, `src/components/admin/wolfek/`, `src/server/wolfek-admin/`: future toggle action/UI and current reports.

To decide during implementation: shared configuration store and maximum acceptable switch propagation delay.
