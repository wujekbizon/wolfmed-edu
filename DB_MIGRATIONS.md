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
| `pnpm db:migrate:cells` | bezpiecznie deduplikuje plansze, dodaje `version` i unikalny indeks `userId` | M8 na dev i prod |
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

*Status: kod przygotowany; dev i prod jeszcze niezmigrowane.*

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

### M10+ — (dopisuj kolejne zmiany tutaj)

Szablon wpisu:

```
### Mx — krótki tytuł
*Status: dev / prod (data).*
- Co się zmienia w schemacie
- Jakie skrypty backfill/seed i w jakiej kolejności
- Co jest destrukcyjne i kiedy wykonać krok "contract"
```
