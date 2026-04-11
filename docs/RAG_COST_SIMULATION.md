# RAG System — Cost Simulation Per User
**Date**: 2026-04-10
**Based on**: actual rate limits from `src/lib/rateLimit.ts`, Gemini 2.5 Flash pricing, Google TTS WaveNet pricing

---

## Courses & Access

| Course | Price | AI Access |
|--------|-------|-----------|
| Opiekun-Medyczny | 499.99 PLN (~$125) | RAG queries + all tools — **no TTS** |
| Pielęgniarstwo | 599.99 PLN (~$150) | RAG queries + all tools + **TTS lectures** |

---

## Rate Limits (current)

| Action | Limit |
|--------|-------|
| `rag:query` | 10 / hour |
| `lecture:generate` | 3 / day → **max 90 / month** |

---

## Per-Action Token Cost

### Plain RAG query (no tool, no @resource)
```
1 Gemini call: queryFileSearchOnly()
```
| | Tokens | Cost |
|--|--------|------|
| Input | ~800 | $0.000060 |
| Output | ~600 | $0.000180 |
| **Total** | | **$0.00024** |

---

### Tool request (`/notatka`, `/utworz`, `/fiszka`, `/diagram`, `/planuj`)
```
4 Gemini calls total:
  1. queryFileSearchOnly()        — supplementary RAG context
  2. executeToolWithContent()     — Gemini dispatches function call
  3. executeToolLocally()         — Gemini generates content
  4. final answer wrap            — Gemini confirms result
```
| Call | Input tokens | Output tokens | Cost |
|------|-------------|---------------|------|
| 1. RAG context | 800 | 800 | $0.000300 |
| 2. Function dispatch | 1,400 | 150 | $0.000150 |
| 3. Content generation | 2,000 | 1,500 | $0.000600 |
| 4. Final wrap | 1,500 | 400 | $0.000233 |
| **Total** | **5,700** | **2,850** | **$0.00128** |

---

### Lecture generation — Pielęgniarstwo only (`/planuj` → `/wyklad`)
```
2 Gemini calls + Google TTS WaveNet (pl-PL-Wavenet-A)
```
| Item | Detail | Cost |
|------|--------|------|
| Gemini call 1 (RAG) | ~800 in / ~800 out | $0.00030 |
| Gemini call 2 (script) | ~2,000 in / ~4,000 out | $0.00165 |
| Google TTS — short script (~15K chars) | WaveNet $16/1M chars | $0.24 |
| Google TTS — medium script (~25K chars) | WaveNet $16/1M chars | $0.40 |
| Google TTS — long script (~45K chars) | WaveNet $16/1M chars | $0.72 |
| **Total per lecture (avg 25K chars)** | | **~$0.40** |

> TTS uses hash deduplication — identical plan = no repeat cost.

---

## Monthly Cost Per User — Scenarios

Exchange rate used: **1 USD ≈ 4.00 PLN**

### Opiekun-Medyczny (no TTS)

| Usage | RAG queries | Tool requests | Monthly cost (USD) | Monthly cost (PLN) |
|-------|-------------|---------------|--------------------|--------------------|
| **Low** — occasional use | 20 | 5 | **$0.011** | **~0.05 PLN** |
| **Medium** — regular study | 60 | 20 | **$0.040** | **~0.16 PLN** |
| **High** — daily power user | 120 | 40 | **$0.081** | **~0.32 PLN** |
| **Max** — hits rate limit | 240 | 80 | **$0.160** | **~0.64 PLN** |

> Opiekun-Medyczny users are effectively **free to serve** — even max usage costs $0.16/month.

---

### Pielęgniarstwo (full AI + TTS)

| Usage | RAG queries | Tool requests | Lectures | Monthly cost (USD) | Monthly cost (PLN) |
|-------|-------------|---------------|----------|--------------------|--------------------|
| **Low** — occasional | 20 | 5 | 2 | **$0.81** | **~3.25 PLN** |
| **Medium** — regular | 60 | 20 | 10 | **$4.04** | **~16.20 PLN** |
| **High** — power user | 120 | 40 | 30 | **$12.08** | **~48.34 PLN** |
| **Max** — hits rate limit | 240 | 80 | 90 | **$36.24** | **~145 PLN** |

---

## ⚠️ Lifetime Revenue vs. Cost — Pielęgniarstwo

This is the key risk with a **one-time payment model + TTS**:

| Usage type | Monthly AI cost | Revenue recovered in... | Months until loss |
|------------|----------------|------------------------|-------------------|
| Low (2 lectures/mo) | $0.81 | $150 / $0.81 = 185 months | Never |
| Medium (10 lectures/mo) | $4.04 | $150 / $4.04 = **37 months** | Year 3+ |
| High (30 lectures/mo) | $12.08 | $150 / $12.08 = **12 months** | Year 1 |
| Max (90 lectures/mo) | $36.24 | $150 / $36.24 = **4 months** | Month 5 |

**Bottom line**: A user generating 90 lectures/month is costing you ~$36/month on a $150 one-time payment. Within 5 months they cost more than they paid.

---

## Recommendations

### 1. Tighten lecture rate limit immediately
Current limit of **3/day (90/month)** is too generous for a one-time payment model.

| Suggested limit | Monthly max lectures | Max TTS cost/user |
|----------------|---------------------|-------------------|
| 1/day = 30/mo | 30 | $12 |
| 5/week = ~20/mo | 20 | $8 |
| **10/month hard cap** | **10** | **$4** ✓ recommended |
| 5/month hard cap | 5 | $2 ✓ conservative |

At **10 lectures/month hard cap**, worst-case cost is $4/user/month → $150 revenue covers 37 months → safe.

### 2. Opiekun-Medyczny — no action needed
Even at max rate limit, cost is $0.16/month. The 499.99 PLN one-time payment is essentially infinite margin.

### 3. Consider separating `lecture:generate` bucket by course
Currently both buckets use the same key. You may want a stricter monthly cap separate from the daily limit.

---

## Action Items

- [ ] Reduce `lecture:generate` rate limit — **10/month** recommended (currently 3/day = 90/month)
- [ ] Verify Google TTS WaveNet pricing in GCP console ($16/1M chars for `pl-PL-Wavenet-A`)
- [ ] Verify Gemini 2.5 Flash pricing in GCP console
- [ ] Fix double RAG call on tool path — saves ~1 Gemini call per tool request (see `RAG_TECH_IMPROVEMENTS.md`)
- [ ] Monitor actual lecture script lengths after first users — determines real TTS cost
