# Jev audit logs

`wolfmed_jev_audit_logs` stores each actual provider call from Dashboard, Kierunki and practice. `src/server/jev/callJev.ts` is the only Jev HTTP transport. It records the exact structured request body, full parsed JSON response, original response text, HTTP status, validation outcome, error details, model/policy version, route, user/session references and elapsed time. Authentication headers and API keys are excluded.

Statuses: `success`, `http_error`, `invalid_response`, `timeout`, `error`. `success` means a valid provider decision; the route may still decline a low-confidence or `other` decision. Cache hits, throttled calls, missing configuration and Redis failures do not contact Jev and therefore do not create provider audit rows.

Logs are server-only, with no public read endpoint. Full questions and access/study context may be personal data; use existing restricted database administration access. User and practice-session deletion cascade to their logs. Anonymous rows contain no IP or browser identifiers.

Apply the additive, rerunnable migration using the intended database's direct connection in `NEON_DATABASE_URL`:

```powershell
pnpm exec tsx --env-file=.env scripts/migrate-jev-audit-logs.ts --apply
```

The migration was prepared, not executed. Apply before deploying logging. Failed audit writes report only route/source metadata and do not prevent Wolfek responses.

Retention is 30 days in `src/constants/jevAudit.ts`. Schedule this maintenance command daily; no schedule was created by this task:

```powershell
pnpm exec tsx --env-file=.env scripts/prune-jev-audit-logs.ts --apply
```

Example audit query:

```sql
SELECT created_at, route, status, http_status, latency_ms,
       request_payload, response_payload, response_text, error_name, error_message
FROM wolfmed_jev_audit_logs
WHERE source = 'kierunki'
ORDER BY created_at DESC
LIMIT 50;
```
