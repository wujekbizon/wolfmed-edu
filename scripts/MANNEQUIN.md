# Fantom 3D — jak to działa i jak to zmienić

Krok "Wykonanie na fantomie" w egzaminie z diagnoz: student wybiera interwencję,
po czym klika miejsce na ciele pacjenta. Ten plik opisuje cały przepływ — od
pliku modelu po ocenę odpowiedzi.

---

## Skąd się co bierze

```
public/models/mannequin.glb          model (546 KB, CC-BY-4.0 — patrz CREDITS.md)
public/models/mannequin-zones.json   mapa: wierzchołek → strefa ciała  ← GENEROWANY
data/diagnozy.json                   exam.bodyZone — poprawna odpowiedź
src/types/diagnozyTypes.ts           BODY_ZONES — lista 12 stref
scripts/lib/mannequinZoneParts.mjs   bryły stref (tylko build, nic tego nie renderuje)
```

Tylko `mannequin-zones.json` jest generowany. Reszta to źródła.

---

## Przepływ w przeglądarce

1. `MannequinBody.tsx` pobiera `.glb` **oraz** `mannequin-zones.json`.
2. `buildMannequinGeometry` skaluje model do wysokości 2.4 i centruje w punkcie
   (0,0,0) — dzięki temu mapa stref pasuje niezależnie od tego, jak model został
   wyeksportowany.
3. Klik → raycast trafia w prawdziwą geometrię → z trójkąta odczytujemy indeks
   wierzchołka → z mapy strefę. **Nie ma niewidzialnych kształtów do klikania.**
4. Podświetlenie: atrybut `aHighlight` (0–1 na wierzchołek) trafia do
   `totalEmissiveRadiance` przez `onBeforeCompile`.

> **Dlaczego emissive, a nie kolor wierzchołków?** Kolory wierzchołków *mnożą*
> teksturę, więc na brązowym ciele mogą je tylko przyciemnić. Podbicie powyżej 1
> rozjaśnia, ale wzmacnia też teksturę i na modelu wychodzą kolorowe kwadraty z
> atlasu palety. Emissive dodaje światło i nie dotyka tekstury.

---

## Zadanie 1 — poprawić zasięg strefy

Objaw: klikam przedramię, zaznacza się tułów.

```bash
# 1. Włącz podgląd stref
#    /panel/diagnozy/egzamin → "Pokaż strefy" (widoczne tylko w dev)
#    Ciało pokoloruje się według stref — od razu widać, gdzie są granice.

# 2. Popraw bryłę w scripts/lib/mannequinZoneParts.mjs
#    Układ: y -1.2 = stopy, y +1.2 = czubek głowy, x dodatnie = LEWA strona pacjenta

# 3. Przelicz mapę
node scripts/bake-mannequin-zones.mjs

# 4. Odśwież stronę i sprawdź ponownie w podglądzie stref
```

Skrypt wypisuje procent wierzchołków na strefę — jeśli `brzuch` ma 2%, a
`klatka-piersiowa` 8%, to znaczy, że klatka schodzi za nisko.

**Kolejność w `PRIORITY` (w `bake-mannequin-zones.mjs`) ma znaczenie.** Oczy leżą
wewnątrz kuli głowy, a plecy zachodzą na klatkę — testujemy od najmniejszych do
największych, inaczej większa bryła "zjada" mniejszą.

---

## Zadanie 2 — wymienić model

```bash
# 1. Podmień public/models/mannequin.glb (zaktualizuj CREDITS.md — licencja!)

# 2. Zmierz nowy model
node scripts/measure-mannequin.mjs
#    Wypisze zakresy x/z w pasmach wysokości i rozdzieli kończyny od tułowia:
#     0.40..0.50 | [-0.46,-0.31] [-0.22,0.22] [0.31,0.46]
#                     ramię          tułów        ramię

# 3. Na tej podstawie popraw bryły w scripts/lib/mannequinZoneParts.mjs
# 4. node scripts/bake-mannequin-zones.mjs
# 5. Sprawdź w podglądzie stref
```

Nazwa pliku `.glb` jest cache'owana przez przeglądarkę bez hasha — przy podmianie
lepiej zmienić nazwę pliku (np. `mannequin-v2.glb`) niż nadpisać starą.

---

## Zadanie 3 — poprawić poprawne odpowiedzi (`exam.bodyZone`)

Krok fantomu ocenia tylko te interwencje, które mają `exam.bodyZone` w
`data/diagnozy.json`. Bez tego pola interwencja jest pomijana przy ocenie.

```bash
node scripts/suggest-body-zones.mjs --resuggest   # → data/body-zones-review.csv
#   Popraw kolumnę finalZone w Excelu.
#   Puste = interwencja bez miejsca na ciele (edukacja, wsparcie) — to normalne.

node scripts/apply-body-zones.mjs --dry-run       # pokazuje liczby, nic nie zapisuje
node scripts/apply-body-zones.mjs                 # → data/diagnozy.json
npx tsx scripts/seed-diagnozy.ts                  # walidacja + zapis do bazy
```

- Bez `--resuggest` skrypt **zachowuje** wartości już zapisane w `diagnozy.json`.
  Po poprawieniu reguł w `lib/bodyZoneRules.mjs` używaj `--resuggest`, inaczej
  stare wartości zostaną na miejscu. Kolumna `previousZone` pokazuje, co się zmieni.
- `apply` dopasowuje wiersze po `slug` + `index` i **sprawdza treść interwencji**,
  więc nieaktualny CSV przerwie działanie zamiast zapisać strefy w złych miejscach.
- CSV jest w `.gitignore` — to plik roboczy, generowany na nowo w sekundę.
- `seed-diagnozy.ts` robi `TRUNCATE` i wstawia wszystko od nowa. Id i slugi są
  zachowane, więc postępy i historia podejść (klucz: `diagnozaSlug`) przeżywają.

---

## Skrypty

| Plik | Kiedy uruchamiać |
|---|---|
| `bake-mannequin-zones.mjs` | po każdej zmianie bryły lub modelu |
| `measure-mannequin.mjs` | tylko przy podmianie modelu |
| `suggest-body-zones.mjs` | gdy poprawiasz reguły lub chcesz zweryfikować odpowiedzi |
| `apply-body-zones.mjs` | po sprawdzeniu CSV |
| `lib/mannequinZoneParts.mjs` | bryły stref — edytujesz, nie uruchamiasz |
| `lib/bodyZoneRules.mjs` | reguły słownikowe — edytujesz, nie uruchamiasz |

Wszystkie działają na czystym `node`, bez `tsx` — stąd rozszerzenie `.mjs`.

---

## Uwagi

**Strony ciała są liczone od pacjenta, nie od ekranu.** Postać zwrócona do kamery
ma lewą stronę po prawej stronie ekranu (x dodatnie). Przyciski "Lewy bok" /
"Prawy bok" pokazują boki *pacjenta* — tak jak w dokumentacji pielęgniarskiej.

**Reguły słownikowe wymagają `\b` na początku rdzenia.** `ran(a|y|ę|ie)` bez
granicy słowa trafia w środek "Pobie-ranie" i każde pobranie krwi lądowało w
strefie `skora`. Przy dodawaniu wzorca sprawdź, czy rdzeń nie siedzi w innym słowie.

**Znane braki:** czas egzaminu (`timeSpent`) jest przysyłany przez klienta i
serwer go nie weryfikuje; egzamin w toku nie przeżywa odświeżenia strony.
