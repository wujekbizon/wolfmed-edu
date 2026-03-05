# Migration Guide

## Lecture Feature (2026-03)

### New DB tables (run `pnpm db:push` in production)

**`lectures`**
- Stores AI-generated audio lectures per user
- Columns: `id`, `userId`, `title`, `contentHash` (SHA-256 for dedup), `audioKey`, `audioUrl`, `scriptText`, `duration`, `createdAt`, `updatedAt`
- Indexes: `lectures_user_id_idx`, `lectures_content_hash_idx` (userId + contentHash)

**`user_limits`** *(if not already applied from the materials feature)*
- Tracks per-user storage quota
- Columns: `id`, `userId` (unique FK → users), `storageLimit` (default 20MB), `storageUsed`, `createdAt`, `updatedAt`
- Index: `user_limits_user_id_idx`

### New environment variables (add to Vercel / production `.env`)

| Variable | Purpose |
|---|---|
| `GOOGLE_TTS_API_KEY` | Google Cloud Text-to-Speech API key for lecture audio generation |
| `GOOGLE_API_KEY` | Google Gemini API key for AI plan/content generation |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook secret (if not already set) |
| `CRON_SECRET` | Secret for protecting cron job endpoints |

> Note: `UPLOADTHING_TOKEN` is already required — the `lectureAudio` route (32MB audio/mpeg) and `materialUploader` route both use it.

### Storage quota behaviour
- Default limit: **20 MB** per user
- Materials: enforced both in the UploadThing middleware (pre-upload) and inside the DB transaction (precise byte check)
- Lectures: checked before upload (`storageUsed + audioSize > storageLimit`); orphaned UploadThing file is cleaned up if the DB transaction fails post-upload

### Rate limits (Upstash Redis required in production)

| Action | Limit |
|---|---|
| `lecture:generate` | 3 per day |
| `lecture:delete` | 20 per hour |

> `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` must be set. Without them rate limiting silently passes in dev but will error in production if not configured.
