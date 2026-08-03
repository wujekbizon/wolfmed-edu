# Wolfmed — Przewodnik migracji bazy danych

Ten dokument prowadzi rejestr zmian w schemacie bazy oraz zasady bezpiecznego
wdrażania ich na produkcję. **Aktualizuj go przy każdej zmianie schematu** —
sekcja „Rejestr migracji" na dole rośnie wraz z projektem.

> Stan obecny: na branchu deweloperskim iterujemy `db:push`-em na bazie dev.
> Na produkcji używamy wersjonowanych migracji SQL (`db:generate` → `db:migrate`).
> Ten dokument opisuje jak jedno przełożyć na drugie.

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
| `pnpm db:generate` | generuje wersjonowaną migrację SQL do `./drizzle` na podstawie różnicy schematu | przed wdrożeniem na prod |
| `pnpm db:migrate` | wykonuje oczekujące migracje SQL z `./drizzle` na bazie z konfiguracji | prod (po `db:generate` i review) |
| `pnpm db:studio` | podgląd/edycja danych (Drizzle Studio) | dev / debug prod |
| `pnpm db:seed:procedures` | TRUNCATE + reseed `wolfmed_procedures` z `data/procedures.json` (zachowuje ID i slugi) | backfill przy M4 |
| `pnpm db:reset:challenges` | TRUNCATE `challenge_completions` + `procedure_badges` (twardy reset Quiz 2.0) | jednorazowo przy M2 |

## Jak wykonać migrację na produkcji (workflow)

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
*Status: do wypchnięcia na dev.*

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

### M7+ — (dopisuj kolejne zmiany tutaj)

Szablon wpisu:

```
### Mx — krótki tytuł
*Status: dev / prod (data).*
- Co się zmienia w schemacie
- Jakie skrypty backfill/seed i w jakiej kolejności
- Co jest destrukcyjne i kiedy wykonać krok "contract"
```
