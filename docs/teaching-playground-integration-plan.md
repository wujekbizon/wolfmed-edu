# Teaching Playground × Wolfmed Edukacja — Integration Plan

> Goal: extend Wolfmed from a self-study exam-prep platform into a **live-classroom service for schools** — scheduled online lectures (video + audio + chat, Teams-like) that plug directly into Wolfmed's existing test/exam engine. Powered by [`@teaching-playground/core`](https://www.npmjs.com/package/@teaching-playground/core) (v1.4.6, public on npm).

---

## 1. Product Vision

**Today:** individual users buy a course (`courses` + `courseEnrollments`), study materials, and take tests/exams in `/panel`.

**New offering ("Wolfmed Live" — working name):** medical schools (szkoły policealne, uczelnie, firmy szkoleniowe) buy seats for their class groups. Teachers schedule and run live lectures; students join from the browser; and — the key differentiator over Teams/Zoom — **the lecture room and the exam engine live on the same platform**:

- Teacher ends a lecture and assigns a test from Wolfmed's existing question bank to everyone who attended.
- Attendance from the live room feeds into course progress and results (`completedTestes`, `testSessions`).
- Study materials, procedures, and AI features (RAG, generated practical exams) are one click away from the classroom.

We are not competing with Microsoft on video quality or scale. We win on **integration**: schedule → lecture → exam → results in one product.

---

## 2. What `@teaching-playground/core` Gives Us Today

Verified against the repo map (v1.4.6):

| Ready to use | State |
|---|---|
| Socket.IO signaling server (`RealTimeCommunicationSystem`) | ✅ solid, tested (174 tests), validated against Wolfmed production logs |
| Client SDK (`RoomConnection`) — join/leave, chat, WebRTC, screen share | ✅ use the newer `webrtc:*` signaling contract (per `WEBSOCKET-FLOW.md`) |
| Lecture lifecycle state machine (`EventManagementSystem.updateEventStatus`) | ✅ the linchpin API — keeps DB, room status, and join-gating in sync |
| Room lifecycle + auto-cleanup | ✅ |
| Participant controls (mute, kick, raise hand) | ✅ server re-checks permissions |
| Client-side recording (`MediaRecorder` → `Blob`) | ✅ but upload/storage is on us |
| Room entry gating by lecture status (v1.4.6) | ✅ built specifically from Wolfmed's bug reports |

| Gap (package side) | Impact |
|---|---|
| **No authentication on socket connections** — user identity/role is self-declared by the client | Must fix before any real school uses this (see §6) |
| `JsonDatabase` flat-file persistence | Dev-only; not multi-instance safe |
| STUN-only, no TURN wiring | Users behind symmetric NAT (typical school/corporate networks!) will fail to connect video |
| P2P mesh WebRTC | Practical ceiling of ~10–15 video participants per room |
| Single-process ephemeral state (no Redis adapter) | Can't scale horizontally yet — fine for MVP |
| `DataManagementSystem`, `saveState`/`loadState`/etc. | No-op stubs — do not rely on them |
| Breakout rooms, waiting rooms, polls, attendance tracking | Roadmap only |

---

## 3. The Critical Constraint: Vercel Cannot Host the Socket Server

Wolfmed deploys to **Vercel** (serverless — see `vercel.json`). Socket.IO needs a **long-lived Node process**. This forces the deployment shape:

```
┌────────────────────────────┐        ┌──────────────────────────────┐
│  wolfmed-edu (Vercel)      │  REST  │  wolfmed-live (new service)  │
│  Next.js 16 App Router     │───────▶│  Node + @teaching-playground │
│  Clerk auth, Neon Postgres │ shared │  /core  (Socket.IO + WebRTC  │
│  Stripe, server actions    │ secret │  signaling)                  │
│                            │        │  Railway / Fly.io / Render / │
│  Scheduling UI, exam       │        │  VPS — always-on             │
│  engine, dashboards        │        └──────────▲───────────────────┘
└──────────▲─────────────────┘                   │ Socket.IO + WebRTC
           │ HTTPS                               │ (browser ↔ service,
           │                                     │  peers ↔ peers)
      ┌────┴─────────────────────────────────────┴───┐
      │              Browser (teacher / student)      │
      │  Next.js pages + RoomConnection client SDK    │
      └───────────────────────────────────────────────┘
```

**`wolfmed-live`** is a small new repo/service (~200 lines of glue):

1. Instantiates **one** `RealTimeCommunicationSystem` and calls `.initialize(httpServer)` on it — and injects that same instance into `EventManagementSystem` via `setCommsSystem()` (the package's internal auto-constructed instances are inert; only the initialized one holds real state — repo map §4.2).
2. Exposes a minimal REST API (guarded by a shared secret header, e.g. `LIVE_SERVICE_API_KEY`) that wolfmed-edu's **server actions** call:
   - `POST /rooms` → `RoomManagementSystem.createRoom`
   - `POST /lectures` → `EventManagementSystem.createEvent`
   - `PATCH /lectures/:id/status` → `updateEventStatus` (**the only way** lecture status ever changes — never mutate status via `updateEvent`)
   - `GET /rooms/:id/participants` → in-memory participant list (for live dashboards)
3. Validates Clerk-issued tokens on socket handshake (§6).

**Division of responsibility:**

- **Wolfmed Postgres = source of truth** for scheduling, membership, entitlements, attendance history, exam links.
- **wolfmed-live = runtime truth** for who is in the room right now, chat, streams. Its `JsonDatabase` is treated as a disposable runtime cache (acceptable for MVP since the service is single-instance; replaced in Phase 2 — §8).
- Participants are **never** read from any database — only via WebSocket events / `getRoomParticipants()` (the deprecated `RoomManagementSystem` participant methods throw by design).

---

## 4. Data Model (new Drizzle tables in wolfmed-edu)

⚠️ Naming: the existing `wolfmed_lectures` table is **AI-generated audio lectures** — an unrelated feature. Prefix everything new with `live`.

```ts
// Schools (B2B customers)
schools: { id, name, slug, contactEmail, stripeCustomerId,
           seatLimit, isActive, createdAt }

// Membership + role within a school (role lives HERE, not globally —
// a person can be a student in Wolfmed B2C and a teacher in a school)
schoolMembers: { id, schoolId, userId /* Clerk id */,
                 role: 'teacher' | 'student' | 'school_admin',
                 groupId?, isActive, joinedAt }
                 // unique (schoolId, userId)

// Class groups within a school (e.g. "Opiekun medyczny, rok 1")
schoolGroups: { id, schoolId, name, courseSlug? /* links to existing courses */ }

// Scheduled live lectures — mirrors the package's Lecture, plus our keys
liveLectures: { id /* = package lecture id */, schoolId, groupId,
                teacherId, roomId /* package room id */,
                title, description, scheduledAt, durationMin,
                status: 'scheduled'|'in-progress'|'completed'|'cancelled'|'delayed',
                assignedTestId? /* → tests.id: the post-lecture exam */,
                recordingUrl?, createdAt, updatedAt }

// Attendance — written when the teacher ends the lecture (snapshot of
// participants from the live service) — feeds exam assignment + reporting
liveLectureAttendance: { id, liveLectureId, userId, joinedAt, leftAt?, durationSec }
```

Status in `liveLectures` is a **mirror** of package state for querying/UI; every transition goes through the live service's `PATCH /lectures/:id/status` first, then updates Postgres in the same server action (single integration point, per package contract).

**Clerk metadata additions** (pattern already used for `role: 'admin'` and `ownedCourses`):
- `metadata.schoolId` + `metadata.schoolRole` → lets `src/proxy.ts` gate the new routes without a DB hit, same as `/admin` today.

---

## 5. Routes & UI (wolfmed-edu)

Follow existing conventions: server components + server actions (Zod-validated per `server-actions.md`), Zustand for client state, modals at page level (CLAUDE.md rule).

```
/szkola                       # school dashboard (role-aware)
  /szkola/plan                # timetable: upcoming live lectures for my group
  /szkola/wyklady             # teacher: schedule/manage lectures (CRUD → server actions → live service REST)
  /szkola/wyklady/[id]/sala   # THE CLASSROOM — client island wrapping RoomConnection
  /szkola/czlonkowie          # school_admin: invite/manage teachers, students, groups
/admin/szkoly                 # Wolfmed staff: create schools, set seat limits
```

**The classroom page** (`/szkola/wyklady/[id]/sala`) is a `'use client'` island:

- `new RoomConnection(roomId, user, NEXT_PUBLIC_LIVE_WS_URL)` — use only the **v1.2 `webrtc:*` contract** (ignore the legacy `offer/answer` path that coexists in `RoomConnection`).
- Must implement the client obligations called out in the package CHANGELOG v1.4.6:
  - handle `join_room_error` → redirect to `/szkola/plan` with a toast ("lecture ended / not started yet");
  - handle `muted_by_teacher` / `mute_all` → actually disable local audio track;
  - handle `kicked_from_room` → tear down local media + peer connections before the server's 1s force-disconnect.
- Layout: teacher video (large) + participant grid, chat sidebar, controls bar (mic/cam/screen-share/raise-hand; teacher extra: mute-all, kick, start/end lecture, record).
- SSR guard: server component checks `schoolMembers` + lecture status before rendering the island; the socket-level auth (§6) is the real enforcement.

**Teacher flow:** schedule (create room + lecture via live service, insert `liveLectures` row) → "Rozpocznij" button → `updateEventStatus('in-progress')` → teach → "Zakończ" → `updateEventStatus('completed')` + snapshot attendance + optional "Przypisz test" step (pick from existing `tests`) → students see the assigned test in `/panel/testy`.

---

## 6. Security (must-fix before any school pilot)

This is the package's biggest gap: **socket connections are unauthenticated and roles are self-declared by the client.** The server re-checks "is this participant a teacher" — but only against the role the client sent on `join_room`. Plan:

1. **Handshake auth (required):** wolfmed-edu mints a short-lived token when rendering the classroom page — either the Clerk session JWT or a signed JWT (`LIVE_JWT_SECRET`, 5 min TTL) carrying `{ userId, username, role, lectureId, roomId }` derived **server-side** from `schoolMembers`. The client passes it in `socket.handshake.auth.token`; wolfmed-live verifies it in a Socket.IO middleware (`io.use(...)`) and **overwrites** whatever identity/role the client later claims in `join_room` with the token's values.
   - Preferred implementation: contribute this upstream to `teaching-playground-core` as a pluggable `authenticate(handshake) → User | null` hook (v1.5.x). Fallback: wrap/patch in wolfmed-live before handing sockets to the package.
2. **Room authorization:** the token binds a user to a specific `roomId` — no roaming into other schools' rooms.
3. **REST API auth:** shared secret header between wolfmed-edu server actions and wolfmed-live; never exposed to the browser.
4. **TURN credentials:** when TURN lands (§8), serve time-limited TURN credentials from wolfmed-edu, not static ones baked into the client.
5. **Recordings:** contain student likeness/voice → store via UploadThing under school-scoped access, retention policy decided with the school (RODO/GDPR — schools will ask; also need a processing agreement, consent notice in the room UI "wykład jest nagrywany").

---

## 7. Exam Integration (the moat)

Reuse, don't rebuild — all of this exists:

- **Assign test after lecture:** `liveLectures.assignedTestId` → on completion, create entries the existing test-taking flow already understands (or simply surface "Test z wykładu" cards in `/panel/testy` filtered by attendance). Rate limiting, scoring, `completedTestes` — all existing machinery.
- **Live quiz during lecture (Phase 3):** the package's chat transport can carry structured messages; a `quiz` message type + a small overlay UI gives Kahoot-style checks without touching WebRTC. (Package roadmap lists polling — coordinate to build it upstream.)
- **Attendance-gated exams:** `liveLectureAttendance` lets a school require "attended ≥ 80% of lectures to unlock the exam" — a feature Teams cannot offer.

---

## 8. Phased Roadmap

### Phase 0 — Spike (≈1 week)
- Stand up wolfmed-live on Railway/Fly with the package as-is (JsonDatabase, no auth), behind a feature flag.
- Hardcode one room; two browsers; verify join/video/chat/screen-share end-to-end from the deployed Vercel app (this validates CORS `ALLOWED_ORIGINS`, WS URL wiring, and NAT behavior on real networks).
- **Exit criteria:** teacher + 5 students hold a 30-min test lecture without manual restarts. Measure how many fail on STUN-only — this decides how urgent TURN is.

### Phase 1 — Pilot MVP (≈4–6 weeks)
- Handshake auth (§6.1–6.3) — blocking for pilot.
- Drizzle tables (§4), Clerk metadata roles, `/szkola` routes + classroom UI (§5).
- Lecture lifecycle server actions calling the live service; attendance snapshot on end.
- Post-lecture test assignment (§7).
- TURN via a managed provider (Twilio NTS / Metered / self-hosted coturn on the same VPS) — school networks make this near-mandatory.
- Cap rooms at **15 participants** (enforce via `maxParticipants`) — honest P2P-mesh ceiling.
- Pilot with 1–2 friendly schools, manual onboarding (Wolfmed admin creates school + members).

### Phase 2 — Productize (≈6–8 weeks)
- **Stripe B2B:** per-seat school subscription (new products; reuse `payments`/`subscriptions` tables + webhook plumbing), school self-serve member management, invite links.
- **Persistence upgrade:** replace JsonDatabase — preferred path is contributing a storage-adapter interface upstream (`RoomStore`/`LectureStore`) so wolfmed-live persists to the same Neon Postgres; fallback is accepting the flat file on a single pinned instance.
- Recordings: upload `Blob` to UploadThing post-lecture, link on `liveLectures.recordingUrl`, playback page with school-scoped access.
- Socket.IO Redis adapter (Upstash Redis is already a dependency in wolfmed) if/when we need >1 instance.
- Reliability: health endpoint (the package's `getSystemStatus()` is fake — write a real one), Sentry on wolfmed-live, reconnect UX polish.

### Phase 3 — Scale & differentiate
- **SFU decision point:** beyond ~15 participants or when schools ask for full-class video, move media through an SFU (LiveKit self-hosted/cloud, or mediasoup) while keeping the package for rooms/chat/lifecycle/signaling of everything else. This is the single biggest future rewrite — architect the classroom UI now so the media layer is swappable (isolate all `RTCPeerConnection` usage behind one hook, e.g. `useLectureMedia()`).
- Breakout rooms (package v1.5.0 plan exists — ideal for OSCE/clinical-case work, straight from the package's own medical-education roadmap), waiting rooms, live quizzes, attendance-gated exams.

---

## 9. Upstream Changes to Request/Contribute in `teaching-playground-core`

Same author owns both repos — cheapest place to fix these is upstream:

1. **Pluggable socket auth hook** (Phase 1 blocker) — `config.authenticate(handshake)`.
2. **Injectable comms instance** in all constructors (today only `EventManagementSystem.setCommsSystem()`), removing the multiple-inert-instances trap.
3. **Storage adapter interface** to replace the JsonDatabase singleton (Phase 2).
4. **TURN config actually read from env/config** (currently documented but unused).
5. Attendance events (`user_joined`/`user_left` with timestamps already exist — add an optional webhook/callback so the host app can persist attendance without a custom fork).
6. Clean up the dual WebRTC signaling paths in `RoomConnection` (delete/deprecate legacy path) and unused deps (`simple-peer`, `@trpc/*`).

---

## 10. Risks & Open Decisions

| Risk | Mitigation |
|---|---|
| P2P mesh won't survive real class sizes (30+) | Hard cap 15 in Phase 1; SFU decision gate in Phase 3; sell "seminar-size" honestly |
| School networks block UDP/WebRTC | TURN over TCP/443 in Phase 1; Phase 0 spike measures real failure rate |
| Single-instance live service = single point of failure | Acceptable for pilot; health checks + auto-restart; Redis adapter later |
| JsonDatabase corruption/loss on restart | Postgres is source of truth; live service state is reconstructible (re-register in-progress lectures on boot via a small replay from wolfmed DB) |
| RODO/GDPR for recordings & minors | Consent UX, retention policy, school data-processing agreement before pilot |
| Naming collision with existing AI `lectures` feature | `live*` prefix everywhere; consider renaming the AI feature to `audioLectures` later |
| Package is v1.x and moving | Pin exact version in wolfmed-live; upgrade via CHANGELOG + migration guides |

**Open product questions (need Grzegorz's call, not blocking Phase 0):**
1. Pricing: per-seat/month vs. per-school flat vs. bundled with course access?
2. Do school students also get individual `/panel` course access (i.e. does a seat include a course enrollment)?
3. Is the pilot school Polish-only UI (assume yes — everything above ships in Polish like the rest of the app)?
4. Recording default: on, off, or teacher's choice per lecture?

---

## 11. Suggested First Steps (concrete)

1. Create `wolfmed-live` repo: Express/Fastify + `@teaching-playground/core@1.4.6`, single `RealTimeCommunicationSystem` wired per §3, REST endpoints, Dockerfile. Deploy to Railway.
2. Add `NEXT_PUBLIC_LIVE_WS_URL`, `LIVE_SERVICE_URL`, `LIVE_SERVICE_API_KEY` to wolfmed-edu env.
3. Build a hidden `/szkola/demo` classroom page using `RoomConnection` (webrtc:* path only) to run the Phase 0 spike.
4. In parallel: draft the auth-hook PR against `teaching-playground-core`.
