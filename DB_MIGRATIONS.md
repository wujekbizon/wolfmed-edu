# Wolfmed — Przewodnik migracji bazy danych

Ten dokument prowadzi rejestr zmian w schemacie bazy oraz zasady bezpiecznego
wdrażania ich na produkcję. **Aktualizuj go przy każdej zmianie schematu** —
sekcja „Rejestr migracji" na dole rośnie wraz z projektem.

> Stan obecny: na branchu deweloperskim iterujemy `db:push`-em na bazie dev.
> Na produkcji używamy wersjonowanych migracji SQL (`db:generate` → `db:migrate`).
> Ten dokument opisuje jak jedno przełożyć na drugie.

---

## Handoff — stan audytu 2026-08-20

Źródło prawdy: Git branch `practical-exam`. Próba wykonana na Neon branch
`practical-exam-test`. Produkcja nie została zmigrowana.

Zakończone i zweryfikowane na kopii produkcji:

1. Wszystkie 48 docelowych tabel, 435 kolumn, 42 FK, 6 check constraints i 3
   enumy są obecne.
2. `course_enrollments`: orphan cleanup i recovery zakończone; 374 real grants
   jako `legacy_lifetime`, source IDs, `starts_at`, FK i unique index.
3. Billing schema/events/payments/subscriptions/checkout orders: expand i orphan
   pseudonymization zakończone.
4. `wolfmed_procedures`: 134 rekordy (31 + 103), zachowane ID/slugi/content;
   legacy table usunięta.
5. Quiz 2.0: 537 legacy completions i 14 badges usunięte; AI smoke test przeszedł.
6. `wolfmed_tests`: `data/tests.json` jest jedynym źródłem prawdy; 23 686 rekordów
   w źródle i DB, 0 inserts/updates/extras/missing/mismatched.
7. Diagnozy: 70 rekordów w źródle i DB, 0 różnic; smoke test potwierdzony przez
   użytkownika.
8. RAG: config przełączony na `wolfmed-kb`, `SERVERLESS`,
   `text-multilingual-embedding-002`, corpus `1112960854006956032`,
   `us-central1`; retrieval smoke test przeszedł.
9. Memory policies: dokładne 3 rekordy z dev DB, idempotency potwierdzona.
10. `stripe_payments_status_idx`: pełny index zgodny z `practical-exam`.
11. Historyczne forum roles pozostają `user`; brak backfillu decyzją użytkownika.

Test-only, nigdy nie wykonywać na produkcji:

- `seed-smoke-user.ts`; branch zawiera Clerk test user, 2 smoke enrollments i
  wygenerowany quiz testowy.

Stripe DB blocker — rozwiązany:

1. Live reconciliation wykazał, że legacy Checkout utworzył 0 Customers; wszystkie
   374 opłacone Sessions były guest purchases. Bulk Customer backfill nie istnieje
   do wykonania. Nowy kod tworzy Customer leniwie przy pierwszym upgrade.
2. Jeden aktywny płatnik Clerk brakujący w DB został odzyskany wraz z płatnością
   i Opiekun Basic `legacy_lifetime` przez `06a1-recover-legacy-paid-user.sql`.
3. `06c-paid-users-postflight.sql` potwierdził 370 aktywnych płatnych użytkowników,
   371 oczekiwanych grantów kursowych, 371 gotowych i 0 brakujących lub błędnych.

Na świeżej kopii recovery uruchomić po `06a`, przed `06b`; zapobiega to błędnej
pseudonimizacji prawidłowej płatności i usunięciu enrollmentu. `06c` uruchomić po
`06b`. Na branchu testowym pozostają dodatkowo wyłącznie dwa granty smoke usera.

Pozostało przed produkcją:

1. Odtworzyć świeżą kopię produkcji i wykonać dokładny replay kroków z tego pliku.
2. Wykonać końcowy schema/data audit.
3. Przygotować maintenance window i uruchomić identyczną sekwencję na produkcji.
4. Podczas deployu potwierdzić Vercel service-account access do wspólnego RAG
   corpus.

Nowa rozmowa: przeczytaj `CLAUDE.md`, następnie ten plik, i rozpocznij od świeżego
replay produkcji oraz końcowego audytu.

---

## Zasady dla produkcji

1. **Backup przed każdą migracją.** Neon: branch bazy (`neon branches create`)
   albo point-in-time restore — utworzenie brancha z prod tuż przed migracją
   daje natychmiastowy rollback.
2. **`db:push` tylko na dev.** Na produkcji generuj migracje SQL:
   `drizzle-kit generate` → przejrzyj wygenerowany SQL → wykonaj świadomie.
   `push` potrafi kasować dane przy zmianach destrukcyjnych bez ostrzeżenia.
3. **Wzorzec expand → backfill → switch → contract:**
   - *expand*: dodaj nowe kolumny/tabele (addytywnie, z defaultami — stary kod
     dalej działa),
   - *backfill*: wypełnij dane skryptem,
   - *switch*: wdróż kod czytający nowe kolumny,
   - *contract*: dopiero po weryfikacji usuń stare kolumny/tabele (osobny deploy).
4. **Kolumny NOT NULL zawsze z DEFAULT** przy dodawaniu do istniejącej tabeli.
5. **Nigdy nie zmieniaj ID ani slugów istniejących rekordów** — odwołują się do
   nich `challenge_completions.procedureId`, URL-e i zakładki użytkowników.
6. **Skrypty seed/reset odpalane na prod muszą być idempotentne** i wypisywać,
   co zrobią, zanim to zrobią.
7. Po migracji: smoke test kluczowych ścieżek (`/panel/plan`, `/panel/procedury/*`,
   wyzwania, egzaminy) zanim ogłosisz sukces.

---

## Skrypty (package.json)

Wszystkie czytają `NEON_DATABASE_URL` (skrypty `tsx` ładują `.env.local`, potem
`.env`; komendy `drizzle-kit` biorą je z `drizzle.config.ts`).

| Komenda | Co robi | Kiedy |
|---|---|---|
| `pnpm db:push` | wypycha schemat z `schema.ts` prosto do bazy (bez pliku SQL) | **tylko dev** |
| `pnpm db:migrate:cells` | bezpiecznie deduplikuje plansze, dodaje `version` i unikalny indeks `userId` | M8 na dev i prod |
| `pnpm db:generate` | generuje wersjonowaną migrację SQL do `./drizzle` na podstawie różnicy schematu | przed wdrożeniem na prod |
| `pnpm db:migrate` | wykonuje oczekujące migracje SQL z `./drizzle` na bazie z konfiguracji | prod (po `db:generate` i review) |
| `pnpm db:studio` | podgląd/edycja danych (Drizzle Studio) | dev / debug prod |
| `pnpm db:seed:procedures` | TRUNCATE + reseed `wolfmed_procedures` z `data/procedures.json` (zachowuje ID i slugi) | backfill przy M4 |
| `pnpm db:seed:tests -- --expected-host=<host> [--execute]` | transakcyjny dry-run/UPSERT pełnego `data/tests.json`; nie usuwa extras | migracja pytań po normalizacji źródła |
| `pnpm db:seed:diagnozy -- --expected-host=<host> [--execute --prune-extras]` | waliduje Zod i synchronizuje `wolfmed_diagnozy` z `data/diagnozy.json` | po utworzeniu tabeli Diagnozy |
| `pnpm db:reset:challenges` | TRUNCATE `challenge_completions` + `procedure_badges` (twardy reset Quiz 2.0) | jednorazowo przy M2 |

## Jak wykonać migrację na produkcji (workflow)

### Próba na kopii produkcji

Przed generowaniem lub wykonywaniem migracji uruchom
[`scripts/production-migration/01-preflight.sql`](./scripts/production-migration/01-preflight.sql)
w Neon SQL Editor na branchu `practical-exam-test`. Skrypt działa w transakcji
read-only i zapisuje stan faktycznego schematu, rozszerzeń, tabel, kolumn oraz
indeksów.

Pierwszy preflight 2026-08-20 potwierdził PostgreSQL 17.11, brak rozszerzeń
`vector` i `pg_trgm`, brak tabeli `drizzle.__drizzle_migrations` oraz jedną różnicę
względem Git `main`: `wolfmed_generated_practical_exams` już istnieje na kopii
produkcji. Statystyki `n_live_tup` były zerowe mimo zajętego miejsca, dlatego przed
DDL uruchom także
[`scripts/production-migration/02-data-preflight.sql`](./scripts/production-migration/02-data-preflight.sql)
dla dokładnych liczników, duplikatów, orphanów i schematu istniejącej tabeli.

Drugi preflight 2026-08-20 potwierdził 6873 użytkowników, 375 dostępów i płatności,
0 subskrypcji, 0 materiałów, 1 notatkę, 35 plansz bez duplikatów oraz 0 duplikatów
aktywnych dostępów. Wykrył 2 osierocone dostępy, 2 płatności i 1 processed event;
muszą przejść kontrolowany cleanup M12 przed dodaniem docelowych więzów. Istniejąca
pusta tabela `wolfmed_generated_practical_exams` ma docelowe kolumny i indeks.

Pierwszy krok DDL na kopii to
[`scripts/production-migration/03-extensions.sql`](./scripts/production-migration/03-extensions.sql):
addytywne, transakcyjne włączenie `pg_trgm` i `vector` przed tabelami pamięci i
biblioteki.

### Dziennik próby `practical-exam-test` — 2026-08-20

Wykonane i zweryfikowane:

1. `01-preflight.sql` — PostgreSQL 17.11, schemat produkcyjny zinwentaryzowany.
2. `02-data-preflight.sql` — dokładne liczniki, duplikaty i orphan rows zapisane.
3. `03-extensions.sql` — `pg_trgm 1.6`, `vector 0.8.0`.
4. `04a-new-feature-tables.sql` — 11 nowych tabel funkcjonalnych i enum
   `flashcard_source`.
5. `04b-new-retrieval-tables.sql` — 7 tabel biblioteki/pamięci oraz indeksy
   HNSW/GIN.
6. `05-existing-table-preflight.sql` — brak duplikatów i kolizji ID procedur;
   wykryto 2 orphan enrollments, 2 payments i 1 processed event.
7. `06a-expand-billing.sql` — docelowe nullable billing fields, lifecycle fields,
   indeksy, FK do checkout orders i kolumny źródeł dostępów.
8. `06b-cleanup-billing.sql` — 2 payments i 1 event spseudonimizowane, 2 orphan
   enrollments usunięte, 373 dostępy oznaczone `legacy_lifetime`; FK i unikalność
   źródła dodane.
9. `07-expand-app-tables.sql` — pozostałe kolumny aplikacyjne, 5 FK użytkownika i
   3 indeksy; istniejące forum posts otrzymały `authorRole='user'`.
10. `08-procedures-preflight.sql` + `procedure-content-preflight.ts` — manifest
    134 procedur dokładnie odpowiadał 31 + 103 rekordom bazy; 31 różnic dotyczyło
    wyłącznie brakującego `data.meta`, zero różnic merytorycznych.
11. `09a-procedures-expand-backfill.sql` — 134 procedury scalone w
    `wolfmed_procedures`, ID/slugi zachowane, wszystkie referencje poprawne;
    stara tabela 103 rekordów pozostawiona jako rollback.
12. Smoke test obu kursów procedur przeszedł. Na branchu dodano wyłącznie
    technicznego użytkownika Clerk test przez `seed-smoke-user.ts`; tego kroku nie
    wykonuje się na produkcji.
13. `10-quiz2-preflight.sql` — 537 legacy completions: 102 order steps, 301 stare
    AI, 134 usunięte visual recognition; 14 badges, zero duplikatów.
14. `11-quiz2-reset.sql` — transakcyjnie usunięto 537 completions i 14 badges;
    obie tabele po resecie mają 0 rekordów.

Wykonane po smoke teście Quiz 2.0 AI:

- `12-procedures-contract-preflight.sql` — 103 rekordy rollback były identyczne
  z unified table; zero braków, różnic, uszkodzonych referencji i zależności.
- `13-procedures-contract.sql` — powtórzył asercje w transakcji, usunął
  `wolfmed_pielegniarstwo_procedures` bez `CASCADE`; unified table zachowała
  134 rekordy (31 + 103), zero uszkodzonych referencji.
- `normalize-test-course-metadata.ts` — znormalizował 147 `meta.course` w
  `data/tests.json` (146 wykrytych grup + 1 stary typo); ponowny dry-run: 0 zmian.
- `seed-pielegniarstwo-tests.ts` — dry-run: 17 785 inserts, 109 updates,
  5 747 unchanged, 52 extras. Transakcyjny UPSERT wykonany; postflight:
  23 641/23 641 source IDs, 0 missing, 0 mismatches. Extras zachowane.
- Review 52 database-only rows: 45 unikalnych pytań dodano do `data/tests.json`,
  7 duplikatów treści odrzucono. Finalne źródło: 23 686 unikalnych ID, wyłącznie
  kanoniczne `meta.course`. Pliki review i jednorazowe skrypty usunięte.
- `16-tests-reset.sql` + `db:seed:tests --execute` — tabela odbudowana dokładnie
  z source of truth. Końcowy dry-run: 23 686 unchanged, 0 inserts, updates,
  extras, missing i mismatched.
- `17-rag-config-preflight.sql` — wykrył legacy
  `fileSearchStores/wolfmedmedicaldocs-p6enp3eu7cte`, nie docelowy Vertex corpus.
- `18-rag-config-switch.sql` — zachował ID/`created_at` rekordu i przełączył go na
  `wolfmed-kb`, `SERVERLESS`, `text-multilingual-embedding-002`, corpus
  `1112960854006956032` w `us-central1`; postflight i smoke test retrieval przeszły.
- `data/diagnozy.json` — duplikat UUID rozdzielony: rekord
  `zachlysniecie-ryzyko-wystapienia` otrzymał UUID v4
  `59698341-7788-445f-b272-5a8fa92ca786`; 70 unikalnych ID i slugów.
- `db:seed:diagnozy` — dry-run 70 inserts; transakcyjny seed wykonany z
  `--prune-extras`; końcowy dry-run: 70 unchanged, 0 inserts, updates, extras,
  missing i mismatched.
- `19-memory-policies-seed.sql` — wstawiono dokładnie 3 rekordy z dev DB,
  zachowując policy ID, typ, klucz, JSON, wersję i `effective_from`; wszystkie
  aktywne (`effective_until=NULL`).
- `20-stripe-payment-status-index.sql` — zastąpił legacy partial index pełnym
  indeksem `paymentStatus`, zgodnym ze schematem `practical-exam`; bez zmian danych.
- Historyczne `forum_posts.authorRole` pozostają `user`; decyzja: brak backfillu.
  Nowe posty zapisują bieżącą rolę Clerk.

Wykonane i zweryfikowane po live Stripe reconciliation:

```powershell
pnpm db:migration:step -- scripts/production-migration/06a1-recover-legacy-paid-user.sql --expected-host=<host>
```

1. Na obecnym `practical-exam-test` odtworzył jednego brakującego użytkownika,
   jedną płatność 49,99 PLN i grant Opiekun Basic `legacy_lifetime`.
2. Na świeżym replay produkcji uruchomić po `06a`, przed `06b`; wtedy zapobiega
   pseudonimizacji płatności i usunięciu prawidłowego enrollmentu.
3. Skrypt jest idempotentny, używa dokładnego live Checkout Session ID, nie
   odtwarza e-maila i nie tworzy Stripe Customer.

Końcowy postflight płatnych użytkowników:

```powershell
pnpm db:migration:step -- scripts/production-migration/06c-paid-users-postflight.sql --expected-host=<host>
```

Uruchomić po `06b`. Grupuje rzeczywiste historyczne płatności 14,99 / 49,99 /
159,99 / 279,99 PLN do oczekiwanego kursu, deduplikuje wielokrotne próby płatności
i wymaga aktywnego Basic `legacy_lifetime`. Zweryfikowany wynik przed uruchomieniem
nowych płatności cyklicznych: 370 płatnych użytkowników, 371 grantów kursowych,
371 gotowych i 0 brakujących/nieprawidłowych; drugi result set pusty.

Produkcja Diagnozy po utworzeniu tabeli:

```powershell
pnpm db:seed:diagnozy -- --expected-host=<production-host>
pnpm db:seed:diagnozy -- --expected-host=<production-host> --execute --prune-extras
pnpm db:seed:diagnozy -- --expected-host=<production-host>
```

1. Pierwsza komenda: dry-run; oczekuj 70 inserts na pustej tabeli.
2. Druga: transakcyjny seed dokładnie ze źródła.
3. Trzecia: oczekuj 70 unchanged oraz 0 inserts, updates, extras, missing,
   mismatched.
4. Po deployu sprawdź listę, jeden przypadek i egzamin Diagnozy.

Produkcja memory policies po utworzeniu tabel `wolfmed_mem_*`:

```powershell
pnpm db:migration:step -- scripts/production-migration/19-memory-policies-seed.sql --expected-host=<production-host>
```

1. Uruchom `19`; wynik musi zawierać dokładnie `answer_grounding`,
   `answer_language`, `medical_disclaimer`, wszystkie w wersji 1.
2. Skrypt jest idempotentny i przerwie się przy nieoczekiwanych policy keys.
3. Po deployu sprawdź odpowiedź tutora po polsku, grounding oraz disclaimer dla
   pytania o dawkowanie lub plan leczenia.

Produkcja — wyrównanie indeksu płatności:

```powershell
pnpm db:migration:step -- scripts/production-migration/20-stripe-payment-status-index.sql --expected-host=<production-host>
```

1. `index_before` może zawierać `WHERE paymentStatus <> 'paid'`.
2. `index_after` musi być pełnym indeksem bez `WHERE`.
3. Krok nie modyfikuje rekordów płatności; wymaga tylko krótkiej blokady DDL.


Produkcja RAG:

```powershell
pnpm db:migration:step -- scripts/production-migration/17-rag-config-preflight.sql
pnpm db:migration:step -- scripts/production-migration/18-rag-config-switch.sql
```

1. Uruchom `17`; musi wykazać jeden oczekiwany legacy store.
2. Uruchom `18`; musi ustawić `wolfmed-kb`, `SERVERLESS`, model i corpus ID.
3. Dodatkowa zmiana poza DB: Vercel Production musi mieć
   `GOOGLE_CLOUD_LOCATION=us-central1`, projekt
   `project-9d10f80c-d5df-459f-8d8` oraz `GOOGLE_SERVICE_ACCOUNT_KEY` z dostępem
   do corpus. Lokalnie działa ADC.
4. Po deployu wykonaj jeden znany query w tutorze lub admin RAG search.

Produkcja — `data/tests.json` jest jedynym źródłem prawdy: 23 686 unikalnych,
kanonicznych pytań. Jednorazowy skrypt normalizacji został wykonany i usunięty.

`16-tests-reset.sql` to wymagany reset danych, nie zwykły preflight. Usuwa całą
zawartość `wolfmed_tests`, aby odrzucić stare/duplikujące ID i umożliwić odbudowę
dokładnie ze źródła. Uruchamiaj go wyłącznie po backupie, w maintenance window,
z gotową komendą seed. Między resetem a seedem tabela jest pusta.

Kolejność po migracji schematu:

```powershell
pnpm db:seed:tests -- --expected-host=<production-host>
pnpm db:migration:step -- scripts/production-migration/16-tests-reset.sql
pnpm db:seed:tests -- --expected-host=<production-host> --execute
pnpm db:seed:tests -- --expected-host=<production-host>
```

1. Pierwsza komenda jest dry-runem: waliduje źródło i połączenie.
2. Reset usuwa stare globalne pytania; nie używa `CASCADE` i przerwie się przy
   FK dependents.
3. Seed natychmiast odbudowuje tabelę transakcyjnie z `data/tests.json`.
4. Ostatni dry-run musi zwrócić `inserts: 0`, `updates: 0`,
   `unchanged: 23686`, `extras: 0`, `missing: 0`, `mismatched: 0`.

Nie uruchamiaj `16-tests-reset.sql` samodzielnie ani przed maintenance window.

Przygotowane, jeszcze niewykonane:

- Końcowy audit pełnego schematu i seedów przed powtórzeniem próby na świeżej
  kopii produkcji.

Pełny wynik audytu `main` → `practical-exam` → `practical-exam-test`, wraz z
blokadami danych i stanem każdej istniejącej tabeli, znajduje się w
[`46-production-database-rollout-status.md`](./.claude/docs/46-production-database-rollout-status.md).

Repozytorium nie ma jeszcze katalogu `drizzle/` ani historii snapshotów. Nie
uruchamiaj `pnpm db:generate` lub `pnpm db:migrate`, dopóki nie przygotujemy
baseline'u schematu `main` i przejrzanego zestawu migracji przyrostowych. Drizzle
`generate` porównuje bieżący schemat z ostatnim snapshotem migracji, a nie z
aktualnym schematem podłączonej bazy.

1. **Backup / branch bazy** (Neon).
2. Na branchu z gotowym `schema.ts`: `pnpm db:generate` — powstaje nowy plik
   `./drizzle/NNNN_*.sql`. **Przejrzyj go** — sprawdź, czy nie ma niezamierzonych
   `DROP`/`ALTER ... DROP COLUMN`. Zacommituj plik SQL razem z kodem.
3. Wdróż migrację na prod: `pnpm db:migrate` (drizzle prowadzi tabelę
   `__drizzle_migrations`, więc każdą migrację wykona **dokładnie raz**).
4. Uruchom potrzebne skrypty backfill/seed (patrz wpis Mx poniżej) — one nie są
   częścią migracji SQL, odpala się je ręcznie i są idempotentne.
5. Deploy kodu (switch). Krok destrukcyjny (`contract`) — dopiero po weryfikacji,
   jako osobna migracja.

> Uwaga: `db:push` i `db:generate` nie mieszają się. Jeśli baza dev była
> aktualizowana push-em, `db:generate` i tak policzy różnicę względem
> `schema.ts` — to `schema.ts` jest źródłem prawdy, nie historia push-y.

---

## Rejestr migracji

### M1 — Planer: tabele learning_plans / learning_plan_concepts / study_logs
*Status: wdrożone na dev (branch `claude/zealous-tesla-nfotbx` i wcześniej).*

- Nowe tabele: `wolfmed_learning_plans`, `wolfmed_learning_plan_concepts`,
  `wolfmed_study_logs`.
- Produkcja: czysto addytywne — `drizzle-kit generate` + wykonanie SQL. Brak
  backfillu (tabele startują puste).

### M2 — Quiz 2.0: generated_quizzes + reset wyzwań
*Status: wdrożone na dev.*

- Nowa tabela: `wolfmed_generated_quizzes` (addytywna, bez backfillu), indeksy
  `generated_quizzes_user_id_idx` i `generated_quizzes_user_proc_type_idx`.
- **Decyzja produktowa:** twardy reset postępów wyzwań przy wdrożeniu Quiz 2.0:
  `pnpm db:reset:challenges` — TRUNCATE `wolfmed_challenge_completions` +
  `wolfmed_procedure_badges`. Na produkcji wykonać **raz**, w oknie wdrożenia,
  po backupie.
- Usunięty typ wyzwania `visual-recognition` — stare wiersze tego typu i tak
  znikają przy resecie; kod ignoruje nieznane typy przy liczeniu odznak.
- **Samoczyszczenie (bez crona):** `saveGeneratedQuiz` przycina tabelę do 3
  najnowszych wierszy na `(userId, procedureId, challengeType)` przy każdym
  zapisie. Tabela nie rośnie w nieskończoność — nie potrzeba zadania
  czyszczącego. Generowanie nie woła już RAG (grounding = kroki procedury
  w promptcie), więc migracja nie dotyka konfiguracji korpusu.

### M3 — Ledger: kolumny w study_logs
*Status: wdrożone na dev.*

- `wolfmed_study_logs` + kolumny `categoryKey varchar(128) NULL`,
  `procedureId varchar(256) NULL`.
- Produkcja: addytywne, zero ryzyka (nullable, bez backfillu). Stare wiersze
  mają NULL — planer traktuje je jak dotychczas.

### M4 — Procedury: jedna tabela dla obu kursów
*Status: wdrożone na dev.*

Zmiany schematu:
- `wolfmed_procedures` + kolumny:
  `course varchar(100) NOT NULL DEFAULT 'opiekun-medyczny'`,
  `slug varchar(256) NOT NULL DEFAULT ''`,
  indeksy `procedures_course_idx`, `procedures_course_slug_idx`.
- **DROP TABLE `wolfmed_pielegniarstwo_procedures`** — tabela nigdy nie była
  czytana przez aplikację (pielęgniarstwo szło ze statycznego JSON), więc drop
  jest bezpieczny; mimo to na prod wykonać dopiero po weryfikacji (contract).

Dane:
- `data/procedures.json` = jedyne źródło: 134 rekordy (31 opiekun + 103
  pielęgniarstwo), każdy z `slug` i `data.meta {course, category}`.
- Backfill: `pnpm db:seed:procedures` — TRUNCATE + insert z zachowaniem
  **oryginalnych ID** (wymóg: completions/URL-e) i **oryginalnych slugów
  opiekuna** (z dawnej mapy `procedureSlugs.ts`).

Kolejność na produkcji:
1. Backup / branch bazy.
2. `pnpm db:generate` → review SQL → `pnpm db:migrate` (dodanie kolumn +
   indeksów; expand). DROP starej tabeli wyślij osobno w kroku 5.
3. `pnpm db:seed:procedures` (backfill — truncate+insert).
4. Deploy kodu czytającego `course`/`slug` z bazy (switch).
5. Po weryfikacji: osobna migracja z `DROP TABLE wolfmed_pielegniarstwo_procedures`
   (contract).

### M5 — Planer: procedury jako zagadnienia
*Status: wdrożone na dev.*

- `wolfmed_learning_plan_concepts` + kolumna `procedureId varchar(256) NULL`.
- Produkcja: czysto addytywne (nullable, bez backfillu) — `drizzle-kit generate`
  + wykonanie SQL. Stare zagadnienia mają NULL i działają jak dotychczas.
- Brak skryptów. Atrybucja czasu wyzwań do zagadnień zaczyna działać od
  pierwszego deploya kodu (wpisy wyzwań niosą procedureId od zawsze).

### M6 — Biblioteka osobista: tabela lib_chunks
*Status: wdrożone na dev (2026-08-03), zweryfikowane na realnych danych.*

- Nowa tabela `wolfmed_lib_chunks` — fragmenty notatek i materiałów ucznia:
  `chunk_id` (PK), `user_id` (FK → `wolfmed_users.userId`, `ON DELETE CASCADE`),
  `source_type`, `source_id`, `title`, `position`, `content`, `content_hash`,
  `embedding vector(768) NULL`, `created_at`.
- Indeksy: `idx_lib_chunk_scope` (user_id, source_type), `idx_lib_chunk_source`
  (source_id, position), `uq_lib_chunk_position` UNIQUE (source_id, position),
  `idx_lib_chunk_trgm` GIN (pg_trgm), `idx_lib_chunk_vec` HNSW (vector_cosine_ops)
  oraz częściowy `idx_lib_chunk_pending` na `embedding IS NULL`.
- **Rozszerzenia:** wymaga `vector` i `pg_trgm` — te same, których używa warstwa
  pamięci, więc na bazach z wdrożonym `mem_*` nie trzeba nic dodawać. Na czystej
  bazie: `pnpm db:memory:extensions` przed pushem.
- Produkcja: czysto addytywne, tabela startuje pusta, brak backfillu. Istniejące
  notatki dopiszą swoje fragmenty przy pierwszej edycji; jednorazowy backfill dla
  starych notatek dopiszemy razem z zamiataczem embeddingów (następny krok).
- `embedding` jest celowo NULL-owalne: wiersze powstają synchronicznie razem
  z notatką, wektory dolicza osobny przebieg. Fragment bez wektora jest niewidoczny
  dla wyszukiwania wektorowego, ale w pełni widoczny dla indeksu trigramowego.
- Kasowanie: FK kasuje kaskadowo przy usunięciu konta, a `eraseUserMemory`
  dodatkowo czyści `lib_chunks` w tej samej transakcji (RODO).
- Brak kroku „contract" — nic nie jest usuwane.

### M7 — Materiały: tekst wyodrębniony raz przy uploadzie
*Status: wdrożone na dev (2026-08-04) — ekstrakcja, chunkowanie i wyszukiwanie
zweryfikowane na realnych PDF-ach. Na prod nie wypchnięte; przed wdrożeniem
przeczytaj przypadki brzegowe, zwłaszcza 1 i 8.*

Zmiany schematu — `wolfmed_materials`, wyłącznie addytywne:

| kolumna | typ | uwagi |
|---|---|---|
| `extracted_text` | `text NULL` | tekst odczytany z pliku raz, przy uploadzie |
| `index_status` | `varchar(32) NOT NULL DEFAULT 'pending'` | `pending` / `indexed` / `unindexable` / `failed` / `not_indexed` |
| `indexed_at` | `timestamptz NULL` | kiedy ostatnio próbowano |

Plus indeks `materials_index_status_idx` na `index_status` (steruje zamiataczem).

Zgodne z zasadą 4: kolumna NOT NULL dodana z DEFAULT, więc stare wiersze nie
blokują migracji. Plik w UploadThing pozostaje nietknięty — `extracted_text`
służy AI, plik służy uczniowi (podgląd, pobieranie, limit 20 MB).

`not_indexed` jest terminalny i oznacza upload z planu podstawowego: kurs jest
sprzedawany z 20 MB miejsca i notatkami, więc wgrywanie działa na każdym planie,
ale wywołanie Gemini czytające plik jest płatne i przysługuje tylko premium.
Zamiatacz wybiera `pending` i `failed` po nazwie, więc status terminalny jest
wykluczony z automatu. **To nie jest zmiana schematu** — kolumna to `varchar(32)`,
nie enum, więc nowa wartość nie wymaga ALTER-a.

**SQL (prod): expand, bez backfillu w tej samej transakcji.**
`drizzle-kit generate` → przejrzyj → wykonaj. Zero destrukcji, brak kroku
„contract". Rollback = `DROP COLUMN` (dane są odtwarzalne — wystarczy ponowna
ekstrakcja).

#### Przypadki brzegowe — przeczytaj przed wdrożeniem na prod

1. **Wszystkie istniejące materiały dostają `pending`.** To znaczy, że zamiatacz
   `/api/cron/library-index` spróbuje wyodrębnić tekst z **każdego** pliku, który
   już jest w bazie — również z plików uczniów bez premium, bo DEFAULT nie zna
   planu. Każda próba to wywołanie Gemini na pliku do 4 MB. Przy
   `EXTRACTION_SWEEP_BATCH = 5` i crona raz dziennie to 5 plików/dobę — biblioteka
   500 plików schodzi ~100 dni.

   *Zalecenie przed prodem — wykonać w tej samej sesji co migrację:*

   ```sql
   -- pliki sprzed wdrożenia nie były sprzedawane jako przeszukiwalne przez AI
   UPDATE wolfmed_materials SET index_status = 'not_indexed'
   WHERE index_status = 'pending';
   ```

   Uczeń z premium odzyskuje indeks, gdy wgra plik ponownie. Alternatywa
   (jednorazowy backfill z limitem kosztu) ma sens tylko wtedy, gdy dokupisz
   podwyższony limit zapytań w Vertex — patrz punkt 8.

2. **`failed` jest ponawiane w nieskończoność.** Trwale uszkodzony PDF wraca do
   zamiatacza przy każdym przebiegu i za każdym razem kosztuje wywołanie modelu.
   Brakuje licznika prób. *Zalecenie:* dodać `index_attempts integer NOT NULL
   DEFAULT 0` i przestać ponawiać powyżej progu (np. 3) — najlepiej **razem z tą
   migracją**, żeby nie robić drugiego ALTER-a na tej samej tabeli.

3. **Podwójna ekstrakcja.** `after()` startuje przy uploadzie, a cron widzi ten
   sam wiersz dopóki jest `pending`. Jeśli oba wejdą jednocześnie, plik zostanie
   przeczytany dwa razy. Skutek jest nieszkodliwy (ten sam tekst, chunki wchodzą
   idempotentnie przez `ON CONFLICT`), ale to podwójny koszt modelu. *Zalecenie:*
   status `processing` ustawiany warunkowo (`UPDATE ... WHERE index_status IN
   ('pending','failed')` z `RETURNING`) jako claim wiersza.

4. **`extracted_text` bywa duże.** 4 MB PDF-a to rzędu 100–300 kB tekstu.
   Postgres schowa to w TOAST, więc `SELECT` bez tej kolumny nie drożeje — ale
   `getMaterialById` pobiera cały wiersz. Jeśli listing materiałów zacznie zwalniać,
   pierwszy krok to wybierać kolumny jawnie zamiast `findFirst` bez projekcji.

5. **Instant restore.** Każda ekstrakcja to jeden zapis dużej wartości do historii
   (0,20 USD/GB-miesiąc na planie Launch). Jednorazowy backfill 500 plików × ~200 kB
   to ~100 MB historii — pomijalne, ale warto wiedzieć, że backfill kosztuje
   dwa razy: model plus historia zapisu.

6. **Kolejność wobec M6 jest dowolna** — te kolumny nie zależą od `lib_chunks`,
   a `lib_chunks` nie zależy od nich. Można wypchnąć razem.

7. **Cron jest zarejestrowany** — `/api/cron/library-index` o 4:00 w `vercel.json`.
   (Wcześniejsza notatka mówiła, że Hobby dopuszcza dwa zadania; to nieprawda —
   limit to 100 zadań, a realnym ograniczeniem jest minimalny interwał dobowy
   i dokładność ±59 min. Oba są dla backstopu bez znaczenia.) Bez crona ekstrakcja
   i tak działa (`after()` przy uploadzie); cron łapie tylko przypadki, w których
   funkcja została ubita w trakcie.

8. **Limit zapytań Vertex.** `online_prediction_requests_per_base_model` liczy
   **żądania**, nie tokeny — w trakcie testów udało się go wyczerpać samym
   zamiataczem embeddingów. Uczeń widzi wtedy „Baza wiedzy jest chwilowo
   przeciążona". *Do zrobienia przed prodem:* złożyć wniosek o podwyższenie limitu.
   Dopóki limit jest domyślny, nie uruchamiaj masowego backfillu z punktu 1.

9. **`embedPendingChunks()` bez argumentów nie filtruje po właścicielu.** Tak woła
   go cron — bierze każdy fragment z `embedding IS NULL`, czyj by nie był.
   Poprawność opiera się więc na tym, że plany podstawowe **w ogóle nie tworzą
   wierszy** w `lib_chunks` (bramka w `notes.ts` i `materials.ts`). Jeśli ktoś doda
   trzecią ścieżkę zapisu fragmentów, musi powtórzyć tę bramkę — albo dołożyć filtr
   planu w zamiataczu.

### M8 — Komórki: unikalny rekord użytkownika i wersjonowanie zapisu
*Status: wdrożone i zweryfikowane na dev (2026-08-10).*

- `wolfmed_user_cells_list.version integer NOT NULL DEFAULT 0` — licznik do
  optymistycznej kontroli współbieżności.
- Unikalny indeks `user_cells_list_user_id_uq` na `userId` wymusza jeden rekord
  planszy na użytkownika.
- `pnpm db:migrate:cells` blokuje tabelę na czas migracji, odrzuca rozbieżne
  duplikaty, usuwa wyłącznie identyczne duplikaty i dodaje kolumnę oraz indeks.
- Dev: migracja wykonana. Zweryfikowano 1 rekord, 1 użytkownika, 0 duplikatów,
  kolumnę `version` i wyłącznie unikalny indeks `user_cells_list_user_id_uq`.
- Dla M8 nie używać `db:push`: nie wykonuje kontrolowanej walidacji i deduplikacji.
- Produkcja: Neon branch/backup → `pnpm db:migrate:cells` → sprawdzić jeden rekord
  na użytkownika i indeks → wdrożyć kod wersjonowanego zapisu. Produkcja jeszcze
  niezmigrowana.

## Stripe Dashboard — katalog produktów

*Status: do wykonania przed uruchomieniem płatności produkcyjnych. To nie jest
migracja bazy danych.*

- Uzupełnić krótki opis i obraz dla każdego istniejącego produktu jednorazowego:
  Opiekun Medyczny Standard/Premium oraz Pielęgniarstwo Standard/Premium.
- Tak samo uzupełnić każdy nowy produkt subskrypcyjny podczas jego tworzenia.
- Zmiany wykonać osobno w Stripe sandbox i live mode; produkty i ich dane nie są
  współdzielone między trybami.
- Nie zmieniać istniejących Price ID. Opis i obraz należą do Stripe Product.
- Po zmianach utworzyć nowe Checkout Session dla każdego wariantu i sprawdzić
  nazwę, opis, obraz, cenę oraz tryb płatności jednorazowej/subskrypcji.

### M9 — Stripe: zamówienia, atomowe płatności i źródła dostępu

*Status: dev wdrożone i zweryfikowane 2026-08-11; prod jeszcze niezmigrowane.*

- Nowa tabela `wolfmed_stripe_checkout_orders`: użytkownik, oferta, model zakupu,
  snapshot ceny/kursu/poziomu, status, aktywny klucz deduplikacji, Stripe Customer
  i Session, wygaśnięcie oraz daty.
- `wolfmed_stripe_payments`: nullable `order_id`, `offer_key`, `access_tier`,
  `invoice_id`; `customerEmail` staje się nullable. Unikalne nullable identyfikatory
  Stripe Session, PaymentIntent i Invoice.
- `wolfmed_processed_events`: nullable `event_type`, `stripe_object_id`, `order_id`
  i `payment_id`. Marker zdarzenia jest zapisywany w tej samej transakcji co zakup.
- `wolfmed_course_enrollments`: nullable `source_type`, `source_id`, `starts_at`,
  `revoked_at`; unikalne `(source_type, source_id)`. Każda opłacona Session tworzy
  osobny grant źródłowy. Upgrade Premium używa `lifetime_upgrade`, więc jego
  późniejsze cofnięcie pozostawia bazowy grant Basic.
- `wolfmed_stripe_subscriptions` bez zmian.

Preflight przed dodaniem unikalnych indeksów:

```sql
SELECT "sessionId", COUNT(*) FROM wolfmed_stripe_payments
WHERE "sessionId" IS NOT NULL GROUP BY "sessionId" HAVING COUNT(*) > 1;

SELECT "paymentIntentId", COUNT(*) FROM wolfmed_stripe_payments
WHERE "paymentIntentId" IS NOT NULL
GROUP BY "paymentIntentId" HAVING COUNT(*) > 1;
```

Oba zapytania muszą zwrócić zero wierszy. Duplikatów nie usuwać automatycznie;
najpierw porównać je ze Stripe Dashboard.

Kolejność na dev:

1. Wykonać preflight.
2. `pnpm db:push`.
3. Oznaczyć istniejące dostępy jako historyczne lifetime:

```sql
UPDATE wolfmed_course_enrollments
SET source_type = 'legacy_lifetime',
    source_id = id::text,
    starts_at = enrolled_at
WHERE source_type IS NULL;
```

4. Sprawdzić, że każdy stary dostęp pozostał aktywny i ma unikalny `source_id`.
5. Wykonać test Stripe Phase 2A+2B z przewodnika 42.

Oferty lifetime upgrade nie wymagają kolejnej migracji DB. Wymagają dwóch cen
jednorazowych Stripe i zmiennych środowiskowych opisanych w przewodniku 42.

Produkcja: osobna wersjonowana migracja expand/backfill po backupie. Nie ustawiać
nowych kolumn `NOT NULL` i nie usuwać `customerEmail` w pierwszym deployu.

### M10 — Stripe: lifecycle zwrotów i sporów

*Status: dev wdrożone i zweryfikowane 2026-08-11; prod jeszcze niezmigrowane.*

- `wolfmed_stripe_payments` + `charge_id varchar(256) NULL` z unikalnym indeksem.
- `amount_refunded integer NOT NULL DEFAULT 0`.
- `refund_status varchar(32) NOT NULL DEFAULT 'none'`.
- `dispute_status varchar(32) NOT NULL DEFAULT 'none'`.
- `updated_at timestamp NOT NULL DEFAULT now()`.
- Migracja wyłącznie addytywna. Brak backfillu i kroku contract. Identyfikator
  Charge uzupełnia pierwszy obsłużony event lifecycle.
- Istniejące płatności dostają stan `none`/`0`. Automatyczne cofnięcie wymaga
  source-aware płatności z M9; historyczne rekordy bez `offer_key`, `sessionId` lub
  `courseSlug` wymagają ręcznego uzgodnienia ze Stripe.

Dev: `pnpm db:push`, potem testy Checkpoint 5 z przewodnika 42. Produkcja:
`pnpm db:generate` → review SQL → backup/branch Neon → `pnpm db:migrate` → deploy.

### M11 — Stripe: subskrypcje miesięczne i Portal

*Status: kod gotowy 2026-08-12; migracja dev/prod niewykonana.*

- Cztery miesięczne oferty, osobne zamówienia `purchase_model=subscription`.
- `wolfmed_stripe_subscriptions`: usuwa unikalność samego `userId`; dodaje
  `order_id`, `offer_key`, `access_tier`, `price_id`, lifecycle i unikalne Stripe
  Subscription/Session. Pola legacy email/Session/Invoice stają się nullable.
- `wolfmed_stripe_payments` + `subscription_id`; każda faktura subskrypcyjna jest
  osobnym wpisem ledgeru.
- `wolfmed_processed_events` + `subscription_record_id`.
- Subskrypcje są domyślnie aktywne w kodzie. Nie uruchamiać aplikacji przed
  migracją i pełną konfiguracją Stripe test mode.

Preflight przed migracją:

```sql
SELECT "subscriptionId", COUNT(*) FROM wolfmed_stripe_subscriptions
GROUP BY "subscriptionId" HAVING COUNT(*) > 1;

SELECT "sessionId", COUNT(*) FROM wolfmed_stripe_subscriptions
WHERE "sessionId" IS NOT NULL GROUP BY "sessionId" HAVING COUNT(*) > 1;

SELECT "userId", "courseSlug", COUNT(*) FROM wolfmed_stripe_subscriptions
WHERE status NOT IN ('canceled', 'incomplete_expired')
GROUP BY "userId", "courseSlug" HAVING COUNT(*) > 1;
```

Dev: preflight → `pnpm db:push` → skonfigurować 4 Prices, Portal i webhooki →
uruchomić aplikację → testy sandbox. Produkcja: backup/Neon branch →
wersjonowana migracja expand/backfill/switch; usunięcie starego unique `userId` jest
wymagane przed dopuszczeniem dwóch kursów.

### M12 — Trwałe usunięcie konta i retencja płatności
*Status: dev wdrożony i backfill wykonany 2026-08-14; prod niewykonane.*

- Billing: `userId` staje się nullable w orders/payments/subscriptions/events.
- Payments + `retention_until`, `pseudonymized_at` i indeks retencji.
- Orders/subscriptions/events + `owner_deleted_at`, `cleanup_after` i indeksy.
- FK `ON DELETE CASCADE` dla custom tests/categories, blog likes, grants,
  lectures, generated practical exams i planner concepts.
- Migracja wymaga wcześniejszego usunięcia orphanów. Najpierw dry run:

```text
pnpm exec tsx --env-file=.env scripts/cleanup-deleted-account-orphans.ts
```

Po review listy, dopiero ręcznie:

```text
pnpm exec tsx --env-file=.env scripts/cleanup-deleted-account-orphans.ts --execute
```

Skrypt odrzuca klucz Stripe live. Na dev: uruchomić cleanup, `pnpm db:push`, potem
cleanup ponownie dla backfillu nowych pól billingowych.
Produkcja: Neon branch/backup, wersjonowana migracja expand, cleanup/backfill,
deploy switch. Termin retencji `sale year + 6, 31 grudnia` jest tymczasowym
założeniem z planu; przed prod wymaga potwierdzenia księgowego.

### M13 — Stripe: zaplanowany downgrade Premium do Basic
*Status: kod gotowy 2026-08-15; migracja dev/prod niewykonana.*

- `wolfmed_stripe_subscriptions` + nullable `schedule_id`, `pending_offer_key`,
  `pending_access_tier`, `pending_price_id`, `pending_change_at`.
- Unikalny nullable indeks `stripe_subscriptions_schedule_id_uq`.
- Migracja jest addytywna, bez backfillu i bez kroku contract.
- Dev: backup/branch → `pnpm db:push` → konfiguracja Portal → Test Clock.
- Produkcja: wersjonowana migracja po backupie, przed wdrożeniem kodu.

### M14+ — (dopisuj kolejne zmiany tutaj)

Szablon wpisu:

```
### Mx — krótki tytuł
*Status: dev / prod (data).*
- Co się zmienia w schemacie
- Jakie skrypty backfill/seed i w jakiej kolejności
- Co jest destrukcyjne i kiedy wykonać krok "contract"
```

---

## Finalna sekwencja produkcyjna — 16 kroków

Uruchom dopiero po udanym replay na świeżej kopii. `.env` musi wskazywać produkcję;
każda komenda chroni host `ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech`.
`seed-smoke-user.ts` nigdy nie trafia na produkcję.

1. **Backup i maintenance.** Utwórz Neon backup/branch, włącz maintenance i
   zatrzymaj nowe Checkouty. Brak komendy repo.

2. **Schema preflight.** Zapisz stan wyjściowy.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/01-preflight.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

3. **Data preflight.** Potwierdź liczniki, orphan rows i duplikaty.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/02-data-preflight.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

4. **Nowe tabele i rozszerzenia.** Dodaj fundamenty bez zmiany danych.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/03-extensions.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:migration:step -- scripts/production-migration/04a-new-feature-tables.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:migration:step -- scripts/production-migration/04b-new-retrieval-tables.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

5. **Billing i płatni użytkownicy.** Odtwórz brakującego płatnika przed cleanupem,
   potem oznacz granty legacy.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/05-existing-table-preflight.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:migration:step -- scripts/production-migration/06a-expand-billing.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:migration:step -- scripts/production-migration/06a1-recover-legacy-paid-user.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:migration:step -- scripts/production-migration/06b-cleanup-billing.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:migration:step -- scripts/production-migration/06c-paid-users-postflight.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

6. **Pozostałe tabele aplikacji.** Dodaj kolumny, FK i indeksy.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/07-expand-app-tables.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

7. **Procedury preflight.** Porównaj manifest i treść przed scaleniem.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/08-procedures-preflight.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm exec tsx --env-file=.env scripts/production-migration/procedure-content-preflight.ts
   ```

8. **Scalenie procedur.** Zachowaj ID/slugi, następnie smoke obu kursów.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/09a-procedures-expand-backfill.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

9. **Reset Quiz 2.0.** Sprawdź stare postępy, potem wykonaj uzgodniony reset.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/10-quiz2-preflight.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:migration:step -- scripts/production-migration/11-quiz2-reset.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

10. **Contract procedur.** Po smoke procedur i Quiz AI sprawdź rollback table,
    potem usuń ją.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/12-procedures-contract-preflight.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:migration:step -- scripts/production-migration/13-procedures-contract.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

11. **Teoria — preflight i dry-run.** Zweryfikuj źródło przed resetem tabeli.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/15-tests-preflight.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:seed:tests -- --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

12. **Teoria — reset i seed.** Reset i seed wykonaj bez przerwy między nimi.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/16-tests-reset.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:seed:tests -- --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech --execute
   pnpm db:seed:tests -- --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

13. **RAG.** Sprawdź legacy config, potem przełącz na Vertex corpus.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/17-rag-config-preflight.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:migration:step -- scripts/production-migration/18-rag-config-switch.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

14. **Diagnozy.** Seed dokładnie ze źródła i wykonaj finalny dry-run.

   ```powershell
   pnpm db:seed:diagnozy -- --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:seed:diagnozy -- --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech --execute --prune-extras
   pnpm db:seed:diagnozy -- --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

15. **Memory i indeks płatności.** Seed policies oraz wyrównaj indeks.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/19-memory-policies-seed.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:migration:step -- scripts/production-migration/20-stripe-payment-status-index.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```

16. **Końcowy audit, deploy i smoke.** Sprawdź finalny stan, wdroż nowy kod,
    ustaw service account do corpus; sprawdź RAG, procedury, Quiz AI, testy,
    Diagnozy i upgrade, potem wyłącz maintenance.

   ```powershell
   pnpm db:migration:step -- scripts/production-migration/14-existing-data-status.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   pnpm db:migration:step -- scripts/production-migration/06c-paid-users-postflight.sql --expected-host=ep-withered-waterfall-a2mu2tk4-pooler.eu-central-1.aws.neon.tech
   ```
