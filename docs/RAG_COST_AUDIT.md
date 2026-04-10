# RAG System — Cost Audit
**Date**: 2026-04-10
**Status**: For review before premium pricing decision

---

## API Services Used

| Service | Model / Voice | Billing Unit |
|---------|--------------|--------------|
| Google Gemini | `gemini-2.5-flash` | per 1M tokens |
| Google TTS | `pl-PL-Wavenet-A` | per 1M characters |
| Gemini File Search Store | storage + queries | **free** (pay once for embedding at upload: ~$0.15/1M tokens) |

> Verify current pricing at: https://ai.google.dev/pricing and https://cloud.google.com/text-to-speech/pricing

---

## Gemini 2.5 Flash — Reference Pricing

| Direction | Price (≤128K ctx) |
|-----------|-------------------|
| Input     | ~$0.075 / 1M tokens |
| Output    | ~$0.30 / 1M tokens |

> Gemini File Search (RAG) queries may incur additional grounding/search fees — confirm in GCP console.

---

## Gemini Calls Per User Action

### Plain RAG question (no `/tool`, no `@resource`)
```
queryFileSearchOnly()  →  1 Gemini call
```
| Item | Tokens (est.) |
|------|--------------|
| System prompt + enhanced query | ~800 input |
| Answer | ~600 output |
| **Total per query** | ~1 400 tokens |
| **Cost per query** | ~$0.00024 |

---

### Tool request (e.g. `/notatka`, `/utworz`, `/fiszka`, `/diagram`, `/planuj`)
```
queryFileSearchOnly()        →  1 Gemini call  (RAG context fetch)
executeToolWithContent()     →  2 Gemini calls (function call + final answer)
executeToolLocally() inside  →  1 Gemini call  (actual content generation)
─────────────────────────────────────────────────────
Total: 4 Gemini calls per tool request
```

| Call | Input tokens (est.) | Output tokens (est.) |
|------|---------------------|----------------------|
| RAG search | 800 | 800 |
| Function call dispatch | 1 200 | 150 |
| Tool content generation | 2 000 | 1 500 |
| Final answer wrap | 1 500 | 400 |
| **Total** | **~5 500** | **~2 850** |
| **Cost** | $0.00041 | $0.00086 |
| **Total per tool request** | **~$0.0013** | |

---

### Lecture generation (`/wyklad` flow)
```
queryFileSearchOnly()    →  1 Gemini call  (RAG enrichment)
executeToolLocally()     →  1 Gemini call  (lecture script)
Google TTS               →  per character  (audio synthesis)
```

Lecture script: ~3 000–8 000 words → ~20 000–50 000 characters

| Item | Cost (est.) |
|------|-------------|
| Gemini calls (2x) | ~$0.001 |
| Google TTS — 20K chars | ~$0.080 |
| Google TTS — 50K chars | ~$0.200 |
| **Total per lecture** | **$0.08 – $0.20** |

> Lectures have hash-based deduplication — same plan reuses stored audio, no repeat TTS cost.

---

## Monthly Cost Projections

Assumptions:
- X = number of active premium users
- Average: 5 plain RAG queries + 3 tool requests + 0.5 lectures per user per month

| Users | RAG queries | Tool requests | Lectures | Monthly total |
|-------|-------------|---------------|----------|---------------|
| 50    | 250 × $0.00024 | 150 × $0.0013 | 25 × $0.14 | **~$3.76** |
| 100   | 500 × $0.00024 | 300 × $0.0013 | 50 × $0.14 | **~$7.51** |
| 200   | 1000 × $0.00024 | 600 × $0.0013 | 100 × $0.14 | **~$15.02** |
| 500   | 2500 × $0.00024 | 1500 × $0.0013 | 250 × $0.14 | **~$37.55** |

> Lectures dominate cost at scale. TTS is the biggest single cost per action.

---

## Current Waste: Double RAG Call on Tool Path

On every tool request, `rag-actions.ts` runs `queryFileSearchOnly()` to get supplementary context **even when the user already provided a `@material` PDF**. This is redundant and costs an extra Gemini call each time.

**Impact**: ~$0.00006 wasted per tool request when a resource is attached  
**Fix**: Skip `queryFileSearchOnly` when `pdfFiles.length > 0 || additionalContext` is already substantial. See `RAG_TECH_IMPROVEMENTS.md`.

---

## Rate Limits (Current)

| Bucket | Limit |
|--------|-------|
| `rag:query` | (check `src/lib/rateLimit.ts`) |
| `lecture:generate` | (check `src/lib/rateLimit.ts`) |

Rate limits are the primary cost protection mechanism. Confirm the limits are tight enough relative to the pricing above.

---

## Pricing Recommendation

Based on the projections above, AI features alone cost roughly **$0.08–0.20 per lecture** and **~$0.0013 per tool request**.

Actual course pricing (one-time payment):

| Course | Price | Model |
|--------|-------|-------|
| Opiekun-Medyczny | 499.99 PLN (~$125) | AI queries + tools, no TTS |
| Pielęgniarstwo | 599.99 PLN (~$150) | AI queries + tools + TTS lectures |

> Upstash Redis costs are negligible at this scale (free tier covers up to 10K commands/day).
> UploadThing costs depend on storage — separate from AI costs.

---

## Lifetime Credit Allocations (Planned)

Target: keep lifetime AI cost per user under ~10% of course revenue.  
See full implementation plan in `RAG_CREDITS_PLAN.md`.

### Opiekun-Medyczny (499.99 PLN / ~$125)

| Credit type | Allocation | Lifetime cost |
|-------------|-----------|---------------|
| AI queries (RAG + tools) | 1,000 | ~$0.88 |
| Lectures (TTS) | 0 | — |
| **Total AI cost** | | **<1% of revenue** |

### Pielęgniarstwo (599.99 PLN / ~$150)

| Credit type | Allocation | Lifetime cost |
|-------------|-----------|---------------|
| AI queries (RAG + tools) | 1,000 | ~$0.88 |
| Lectures (TTS) | 25 | ~$10.00 |
| **Total AI cost** | | **~$10.88 (~7% of revenue)** |

> 1,000 queries ≈ 1 year of active daily studying (5 sessions/week × ~4 queries).

---

## Topup Pack Pricing

### Lecture packs (Pielęgniarstwo users only)

| Pack | Price | Cost to us | Margin |
|------|-------|------------|--------|
| 5 lectures | 19.99 PLN | ~$2 (~8 PLN) | ~12 PLN |
| 10 lectures | 34.99 PLN | ~$4 (~16 PLN) | ~19 PLN |
| 20 lectures | 59.99 PLN | ~$8 (~32 PLN) | ~28 PLN |

### AI query packs (both courses)

| Pack | Price | Cost to us | Margin |
|------|-------|------------|--------|
| 500 queries | 14.99 PLN | ~$0.37 (~1.5 PLN) | ~13.5 PLN |

> Query packs will rarely sell — 1,000 lifetime is generous. Lecture packs are the main topup product.

---

## Action Items

- [ ] Confirm actual Gemini 2.5 Flash pricing in GCP console (may differ from estimates)
- [x] Confirmed: File Search storage and queries are free — only embedding at upload time is charged (~$0.15/1M tokens, one-time per document)
- [x] Rate limits confirmed: `rag:query` 10/hour, `lecture:generate` 3/day (to be replaced by lifetime credits)
- [ ] Fix double RAG call on tool path (see `RAG_TECH_IMPROVEMENTS.md`)
- [ ] Implement lifetime credit system (see `RAG_CREDITS_PLAN.md`)
- [ ] Monitor actual token usage via GCP after first week of premium users
