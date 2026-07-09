import { CATEGORIES, TOPIC_TYPES, type TopicType } from "./types"

/**
 * Canonical branch structures per topic type. Guidance, not constraints: the
 * prompt tells the model to use these when they fit, omit empty branches, and
 * add missing ones. `generic` lets the model decide freely, so the feature
 * works for any subject (including non-medical) with no prompt edits.
 */
export const TOPIC_TEMPLATES: Record<TopicType, string[]> = {
  disease: [
    "Definicja",
    "Epidemiologia",
    "Etiologia",
    "Patofizjologia",
    "Klasyfikacja",
    "Objawy",
    "Diagnostyka",
    "Leczenie",
    "Powikłania",
    "Rokowanie",
  ],
  drug: [
    "Mechanizm działania",
    "Wskazania",
    "Przeciwwskazania",
    "Działania niepożądane",
    "Farmakokinetyka",
    "Interakcje",
    "Przykłady",
  ],
  procedure: ["Zasada", "Wskazania", "Technika", "Wartości prawidłowe", "Interpretacja", "Powikłania"],
  anatomy: ["Położenie", "Budowa", "Funkcja", "Unaczynienie", "Unerwienie", "Znaczenie kliniczne"],
  physiology: ["Definicja", "Składowe", "Regulacja", "Pomiar", "Znaczenie kliniczne"],
  syndrome: ["Definicja", "Etiologia", "Objawy", "Diagnostyka", "Postępowanie"],
  skill: ["Cel", "Wskazania", "Przygotowanie", "Przebieg", "Powikłania", "Dokumentacja"],
  concept: ["Definicja", "Kluczowe elementy", "Rodzaje", "Zastosowanie", "Przykłady"],
  process: ["Definicja", "Etapy", "Czynniki wpływające", "Regulacja", "Znaczenie"],
  generic: [],
}

const templatesBlock = TOPIC_TYPES.map((type) => {
  const branches = TOPIC_TEMPLATES[type]
  return branches.length ? `- ${type}: ${branches.join(", ")}` : `- ${type}: (model wybiera 4–7 gałęzi swobodnie)`
}).join("\n")

export function buildSystemPrompt(): string {
  return `Jesteś generatorem map myśli dla platformy edukacji medycznej. Zwracasz WYŁĄCZNIE poprawny JSON zgodny ze schematem MindMapNode. Bez ogrodzeń kodu, bez wstępu, bez komentarzy.

Schemat węzła:
{ "label": string, "children": MindMapNode[], "metadata": { "category": string, "tags": string[] } }

Zasady:
1. Najpierw sklasyfikuj temat jako jeden z topicType: ${TOPIC_TYPES.join(", ")}. Jeśli nic nie pasuje, użyj "generic". Zapisz go w metadata.topicType węzła głównego.
2. Użyj kanonicznej struktury gałęzi dla danego typu, gdy pasuje — pomiń puste gałęzie, dodaj brakujące:
${templatesBlock}
3. JĘZYK ETYKIET musi być taki sam jak język tematu wejściowego. Utrwalone terminy łacińskie/greckie i uniwersalne skróty (EKG, OUN, RKO, BNP) zostaw bez zmian.
4. Etykiety to frazy rzeczownikowe, maks. 4 słowa. Nigdy zdania ani pytania.
5. Poziom 1: 4–7 gałęzi. Poziom 2: 2–5 dzieci. Poziom 3 tylko dla wyliczalnych list. Maks. 6 dzieci na węzeł, maks. głębokość 3.
6. Nadaj metadata.category każdej gałęzi z listy: ${CATEGORIES.join(", ")}. Dla tematów niemedycznych używaj "other".
7. metadata.tags: 1–3 małe litery, slug.`
}

export function buildUserPrompt(topic: string): string {
  return `Temat: ${topic}\n\nWygeneruj mapę myśli jako JSON węzła głównego (root) zgodnego ze schematem.`
}
