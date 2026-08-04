# Plan testów — Asystent AI, biblioteka i źródła

Zakres: wszystko, co powstało lub zmieniło się w gałęzi `claude/practical-exam-branch-g3jsbx`.
Dotyczy komend i chipów, notatek, materiałów, wyszukiwania kontekstu, pamięci ucznia,
`@resource` oraz podziału na plan podstawowy i premium.

**Legenda wyniku:** ✅ zgodnie z opisem · ❌ niezgodnie (opisz co zobaczyłeś) · ⚠️ działa, ale budzi wątpliwości.

---

## 0. Przygotowanie

### Konta
| Konto | Plan | Do czego |
|---|---|---|
| A | premium | Większość testów |
| B | podstawowy (basic) | Wyłącznie rozdział 7 |

### Dane testowe (załóż na koncie A przed startem)

1. **Materiał PDF — tematyka medyczna**, np. wykład o błonach komórkowych.
2. **Materiał PDF — tematyka spoza medycyny**, np. wykład z socjologii.
   Potrzebny do sprawdzenia, czy system nie cytuje przypadkowych źródeł.
3. **Notatka „poprawna"** — treść zgodna z kursem.
4. **Notatka „błędna"** — celowo sprzeczna z materiałem programowym.
   Przykład: tytuł `cholesterol w błonie komórkowej`, treść:
   > Cholesterol w błonie komórkowej zmniejsza jej sztywność i grubość, przez co błona staje się bardziej przepuszczalna dla jonów.

   (Materiał programowy mówi odwrotnie: **zwiększa** sztywność, grubość i plastyczność.)
5. **Notatka „szkicowa"** — same hasła, bez zdań. Tytuł `transport przez błonę`, treść:
   > dyfuzja prosta - bez energii / aktywny - ATP / osmoza woda

### Logi serwera
Część testów wymaga zajrzenia do logów. Szukaj linii zaczynających się od `[retrieval]`.
Format:

```
[retrieval] "pytanie ucznia"
  personal query: "pytanie po oczyszczeniu"      ← tylko gdy różni się od pytania
  corpus (12) · distance, lower better           ← baza wiedzy: NIŻEJ = lepiej
  ✓ 0.162  corpus   01_fizjologia_komorki.md
  personal (2) · score, higher better            ← notatki/materiały: WYŻEJ = lepiej
  ✓ 0.707  note     transport przez błonę
  selected 12
```

`✓` = fragment trafił do modelu · `·` = został znaleziony, ale odrzucony.

> **Uwaga:** wyniki `corpus` i `personal` pochodzą z dwóch różnych silników i **nie są
> porównywalne między sobą**. 0.162 w `corpus` i 0.707 w `personal` to oba dobre wyniki.

---

## 1. Ustawienia: komendy i chipy

Przełącznik „komendy ukośnikiem" w ustawieniach. Zasada: **albo chipy, albo `/`, nigdy jedno i drugie.**

| # | Krok | Oczekiwany wynik |
|---|---|---|
| 1.1 | Włącz komendy `/` | Rząd chipów **nie** jest renderowany |
| 1.2 | Wpisz `/` w polu czatu | Otwiera się lista podpowiedzi z komendami |
| 1.3 | Wyłącz komendy `/` | Rząd chipów **jest** widoczny |
| 1.4 | Wpisz `/` przy wyłączonych komendach | Lista podpowiedzi **się nie otwiera**, `/` to zwykły znak |

**1.5 — Zgodność obu ścieżek (ważne).** Wykonaj to samo zadanie raz chipem, raz komendą `/`.
Wynik musi być **taki sam**: ta sama komórka, ten sam typ treści, ten sam pasek postępu.

**1.6 — Zestaw chipów.** Widoczne: `Notatka`, `Test`, `Podsumowanie`, `Diagram`, `Fiszki`, `Plan nauki`.
**Nie ma chipa `Wykład`** — ale komenda `/wyklad` nadal działa po włączeniu komend `/`.

---

## 2. Narzędzia AI

Każde uruchom **dwiema drogami** (chip i `/komenda`), jeśli chip istnieje.

| # | Komenda | Oczekiwany wynik |
|---|---|---|
| 2.1 | `/notatka` | Powstaje komórka notatki z treścią |
| 2.2 | `/utworz` | Powstaje komórka testu |
| 2.3 | `/podsumuj` | **Podsumowanie pojawia się w oknie czatu** (nie tworzy komórki) |
| 2.4 | `/diagram` | Powstaje diagram; procesy → flowchart, zależności czasowe → sequence |
| 2.5 | `/fiszka` | Powstaje talia fiszek **z treścią** (nie pusta) |
| 2.6 | `/planuj` | Powstaje plan nauki dotyczący **tematu**, nie „jak używać narzędzia" |
| 2.7 | `/wyklad` | Działa mimo braku chipa |

### 2.8 — Liczba elementów (regresja)
W chipie `Test` ustaw **10 pytań**. Ma powstać **dokładnie 10**, nie 5.
To samo dla `Fiszki` — ustawiona liczba ma być respektowana.

### 2.9 — Pasek postępu (regresja)
W **jednej** komórce uruchom narzędzie **trzy razy pod rząd**.
Pasek postępu musi pojawić się **za każdym razem**, nie tylko przy pierwszym.

### 2.10 — Brak źródła
Poproś o materiał na temat, którego nie ma ani w kursie, ani w Twoich plikach.
Narzędzie **nie może wymyślić treści** — ma napisać, czego zabrakło.

---

## 3. `@resource` — wskazanie konkretnego źródła

Wpisz `@` i wybierz plik lub notatkę z listy.

| # | Krok | Oczekiwany wynik |
|---|---|---|
| 3.1 | `@[twój PDF]` + `/podsumuj` | Podsumowanie obejmuje **cały dokument**, od początku do końca, a nie 2–3 fragmenty |
| 3.2 | To samo, sprawdź logi | **Nie ma bloku `[retrieval]`** — wskazane źródło omija wyszukiwanie |
| 3.3 | `@[notatka]` + `/utworz` | Test powstaje z treści notatki |
| 3.4 | `@` + fragment nazwy | Lista filtruje się po nazwie |

> Test 3.1 najłatwiej ocenić na PDF-ie z wyraźną strukturą: podsumowanie ma zawierać
> tematy z **początku i końca** dokumentu, nie tylko te pasujące do słowa „podsumowanie".

---

## 4. Wyszukiwanie źródeł — 6 przypadków

Sercem testów jest panel **Źródła** pod odpowiedzią oraz logi `[retrieval]`.
Kolory i ikony: `Baza wiedzy` (niebieski), `Twój materiał` (bursztynowy), `Twoja notatka` (zielony).

### 4.1 Pytanie w pełni z kursu
Pytanie: `Jakie są zasady pomiaru ciśnienia tętniczego?` (temat nieobecny w Twoich plikach)

- Panel źródeł: **wyłącznie `Baza wiedzy`**.
- Log: `personal (0)` lub linia `[retrieval] personal miss`.
- ❌ jeśli pojawi się jakikolwiek Twój plik lub notatka.

### 4.2 Materiał uzupełnia kurs
Pytanie o temat, który jest **i** w kursie, **i** w Twoim PDF-ie.

- Panel: `Baza wiedzy` **oraz** `Twój materiał`.
- Treść z Twojego pliku jest widoczna w odpowiedzi.
- Kurs nadal dominuje — plik uzupełnia, nie zastępuje.

### 4.3 Notatka szkicowa
Pytanie: `Na czym polega transport aktywny przez błonę komórkową?` (masz notatkę hasłową)

- Notatka może się pojawić w źródłach.
- ❌ jeśli hasła z notatki zostaną rozwinięte w pewne twierdzenia, których tam nie ma.
- ✅ jeśli notatka jest użyta ostrożnie albo pominięta, a odpowiedź opiera się na kursie.

### 4.4 Notatka sprzeczna z kursem ⚠ najważniejszy test
Pytanie: `Jaki wpływ ma cholesterol na błonę komórkową?` (masz notatkę „błędną")

Wszystkie pięć warunków musi być spełnione:

1. W źródłach są **kurs i notatka**.
2. Odpowiedź merytoryczna jest **zgodna z kursem** (zwiększa sztywność).
3. Sprzeczność jest **nazwana wprost**.
4. Odpowiedź mówi **co konkretnie twierdzi Twoja notatka** — nie samo „w notatce jest inaczej".
5. ❌ jeśli odpowiedź jest po prostu poprawna i **milczy** o notatce. To wygląda na zaliczenie, a nim nie jest.

### 4.5 Pytanie spoza kursu, odpowiedź z Twojego pliku
Pytanie o pojęcie z Twojego PDF-a spoza medycyny, np. `wyjaśnij pojęcie etnocentryzm`

- Log: `[retrieval] corpus miss (best 0.xxx > 0.34), dropping 12 chunks`.
- Panel źródeł: **tylko `Twój materiał`**, ani jednej pozycji `Baza wiedzy`.
- Odpowiedź zawiera definicję z Twojego pliku.
- Odpowiedź **nie sugeruje**, że to materiał programowy.

### 4.6 Materiał nie na temat nie jest cytowany
Zadaj pytanie **medyczne**, mając wgrany PDF **z socjologii**.

- ❌ jeśli PDF z socjologii pojawi się w panelu źródeł.
- Log: `[retrieval] personal miss (< 0.6), dropping N of M chunks`.
- Sprawdź też odwrotnie: gdy **jedna** notatka jest trafna, **pozostałe** pliki i tak mają zniknąć.

---

## 5. Jakość odpowiedzi

Sprawdzaj przy **każdej** odpowiedzi w rozdziale 4.

| # | Co sprawdzić | ❌ Błąd |
|---|---|---|
| 5.1 | Brak odnośników do fragmentów | `[1]`, `[BAZA WIEDZY]`, `(BAZA WIEDZY)`, `(BAZA WIEDZY — plik.md)`, `[2, TWÓJ MATERIAŁ]` |
| 5.2 | Zachowana treść w nawiasach | Zniknęło `(1) krok pierwszy` albo `(np. GLUT)` — to **nie są** odnośniki |
| 5.3 | Odpowiedź na zadane pytanie | Odpowiedź schodzi na tematy poboczne, o które nikt nie pytał |
| 5.4 | Brak powtórzeń | Ta sama informacja podana dwa razy innymi słowami |
| 5.5 | Formatowanie list | Wcięcia i zagnieżdżenia punktów nie są połamane |
| 5.6 | Sprzeczności na temat | Odpowiedź wyciąga błąd z notatki **niezwiązanej** z pytaniem |

---

## 6. Pamięć ucznia

| # | Krok | Oczekiwany wynik |
|---|---|---|
| 6.1 | Zapytaj o **siebie**: „jakie są moje postępy?", „czego się ostatnio uczyłem?" | Odpowiedź z pamięci; **brak** panelu źródeł z bazą wiedzy |
| 6.2 | Zapytaj o **temat medyczny** | Fakty o uczniu **nie** trafiają do odpowiedzi merytorycznej |
| 6.3 | Ustaw preferencję (np. krótsze odpowiedzi) i zadaj pytanie merytoryczne | Ton i długość dostosowane, treść nadal z dokumentów |

---

## 7. Plan podstawowy vs premium 💰

Konto B (podstawowy). **Ten rozdział wymaga podglądu bazy danych.**

| # | Krok | Oczekiwany wynik |
|---|---|---|
| 7.1 | Utwórz notatkę | Zapisuje się i otwiera normalnie |
| 7.2 | Sprawdź `lib_chunks` dla tej notatki | **Zero wierszy** |
| 7.3 | Wgraj PDF (w limicie 20 MB) | Wgrywa się bez błędu |
| 7.4 | Sprawdź `materials.index_status` | Wartość `not_indexed` |
| 7.5 | Sprawdź `lib_chunks` dla tego pliku | **Zero wierszy** |
| 7.6 | Przekrocz 20 MB | Komunikat o limicie — limit obowiązuje wszystkich |
| 7.7 | Usuń notatkę i plik | Usuwa się bez błędu |

**7.8 — Test dobowy (najważniejszy finansowo).** Zostaw plik z 7.3 na **24 godziny**.
Następnego dnia `index_status` ma **nadal** brzmieć `not_indexed`, a `lib_chunks` ma być puste.
❌ jeśli status zmieni się na `indexed` — nocne zadanie przetworzyło plik mimo braku premium.

**7.9 — Konto premium (kontrola).** Te same kroki na koncie A:
notatka i PDF **mają** utworzyć wiersze w `lib_chunks`, a `index_status` ma dojść do `indexed`.

---

## 8. Regresje

| # | Co | Oczekiwany wynik |
|---|---|---|
| 8.1 | Panel `/panel` — okna modalne | Otwierają się na środku ekranu, nie są przycięte |
| 8.2 | Formularze (notatka, materiał) | Błędy walidacji **pod właściwym polem**, nie ten sam komunikat pod każdym |
| 8.3 | Notatka z polskimi znakami i akapitami | Po zapisie akapity są rozdzielone; **brak** sklejeń typu `OrganizmieKrew` |
| 8.4 | Długa notatka (kilka stron) | Zapisuje się w całości |
| 8.5 | Usunięcie materiału | Znika z listy **i** przestaje pojawiać się w źródłach odpowiedzi |
| 8.6 | Mapa myśli → „wyjaśnij węzeł" | Wyjaśnienie dotyczy węzła, nie całej mapy |
| 8.7 | Kilka pytań szybko po sobie | Brak pomieszania odpowiedzi między komórkami |

---

## 9. Sytuacje awaryjne

| # | Sytuacja | Oczekiwany komunikat |
|---|---|---|
| 9.1 | Wiele zapytań w krótkim czasie | `Baza wiedzy jest chwilowo przeciążona...` — komunikat, **nie** biały ekran |
| 9.2 | Pytanie o coś, czego nie ma nigdzie | Wprost: brak informacji w dokumentach. **Nigdy** odpowiedź z wiedzy ogólnej modelu |
| 9.3 | Pusty PDF lub sam skan bez tekstu | Materiał oznaczony jako nieprzetworzony, brak awarii |
| 9.4 | Bardzo długie pytanie (kilka zdań) | Odpowiedź nadal trafna; sprawdź `personal query` w logu |

---

## 10. Zgłaszanie błędów

Do każdego ❌ dołącz:

1. Numer testu i konto (A/B).
2. **Dokładne pytanie**, skopiowane, nie z pamięci.
3. Odpowiedź AI i listę źródeł z panelu.
4. **Cały blok `[retrieval]`** z logów — bez niego nie da się odtworzyć przyczyny.
5. Datę i godzinę.

### Kolejność przy ograniczonym czasie
1. Rozdział 7 (koszty) — 7.8 uruchom **pierwszego dnia**, bo wymaga doby.
2. Test 4.4 (notatka sprzeczna z kursem).
3. Rozdział 4 w całości.
4. Rozdział 5 przy okazji rozdziału 4.
5. Reszta.
