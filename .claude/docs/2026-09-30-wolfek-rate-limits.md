# Wolfek paid-call limits

Dashboard and Kierunki typed questions use `reserveCompanionJevCall` after a validated cache miss. Signed-in users share 6 calls/minute and 120 calls/hour across both routes. Anonymous visitors have separate IP identities with 3 calls/minute and 20 calls/hour. Thresholds are initial abuse settings in `src/constants/companionJevRateLimit.ts`, to be tuned with traffic.

One Redis Lua operation checks rolling counters and reserves a five-second lock for the question fingerprint. Concurrent duplicates do not call Jev again; they fall back to the topic buttons until a cached decision is available. Missing Redis or errors reading cache/reserving a call stop inference. Failed provider calls still consume a reservation. No total daily budget is enforced.

Separate 600/hour request guards protect context loading. Cache hits consume those request guards, but no paid-call allowance. Predefined buttons do not call Jev. Practice retains its independent atomic per-user gate, 45-second session cooldown and trigger deduplication.
