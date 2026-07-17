# Wolfmed — Przewodnik migracji bazy danych

Ten dokument prowadzi rejestr zmian w schemacie bazy oraz zasady bezpiecznego
wdrażania ich na produkcję. **Aktualizuj go przy każdej zmianie schematu** —
sekcja „Rejestr migracji" na dole rośnie wraz z projektem.

> Stan obecny: wszystkie zmiany robimy na branchu deweloperskim z bazą dev
> (`db:push` + skrypty seed). Ten dokument przygotowuje nas na moment, w którym
> te same zmiany trzeba będzie wykonać na produkcji.

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

## Rejestr migracji

### M1 — Planer: tabele learning_plans / learning_plan_concepts / study_logs
*Status: wdrożone na dev (branch `claude/zealous-tesla-nfotbx` i wcześniej).*

- Nowe tabele: `wolfmed_learning_plans`, `wolfmed_learning_plan_concepts`,
  `wolfmed_study_logs`.
- Produkcja: czysto addytywne — `drizzle-kit generate` + wykonanie SQL. Brak
  backfillu (tabele startują puste).

### M2 — Quiz 2.0: generated_quizzes + reset wyzwań
*Status: wdrożone na dev.*

- Nowa tabela: `wolfmed_generated_quizzes` (addytywna, bez backfillu).
- **Decyzja produktowa:** twardy reset postępów wyzwań przy wdrożeniu Quiz 2.0:
  `npx tsx scripts/reset-challenge-progress.ts` — TRUNCATE
  `wolfmed_challenge_completions` + `wolfmed_procedure_badges`.
  Na produkcji wykonać **raz**, w oknie wdrożenia, po backupie.
- Usunięty typ wyzwania `visual-recognition` — stare wiersze tego typu i tak
  znikają przy resecie; kod ignoruje nieznane typy przy liczeniu odznak.

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
- Backfill: `npx tsx scripts/seed-procedures.ts` — TRUNCATE + insert z
  zachowaniem **oryginalnych ID** (wymóg: completions/URL-e) i **oryginalnych
  slugów opiekuna** (z dawnej mapy `procedureSlugs.ts`).

Kolejność na produkcji:
1. Backup / branch bazy.
2. Wykonaj SQL: dodanie kolumn + indeksów (expand).
3. `npx tsx scripts/seed-procedures.ts` (backfill — truncate+insert).
4. Deploy kodu czytającego `course`/`slug` z bazy (switch).
5. Po weryfikacji: `DROP TABLE wolfmed_pielegniarstwo_procedures` (contract).

### M5 — Planer: procedury jako zagadnienia
*Status: wdrożone na dev.*

- `wolfmed_learning_plan_concepts` + kolumna `procedureId varchar(256) NULL`.
- Produkcja: czysto addytywne (nullable, bez backfillu) — `drizzle-kit generate`
  + wykonanie SQL. Stare zagadnienia mają NULL i działają jak dotychczas.
- Brak skryptów. Atrybucja czasu wyzwań do zagadnień zaczyna działać od
  pierwszego deploya kodu (wpisy wyzwań niosą procedureId od zawsze).

### M6+ — (dopisuj kolejne zmiany tutaj)

Szablon wpisu:

```
### Mx — krótki tytuł
*Status: dev / prod (data).*
- Co się zmienia w schemacie
- Jakie skrypty backfill/seed i w jakiej kolejności
- Co jest destrukcyjne i kiedy wykonać krok "contract"
```
