import { CategoryMetadata } from "@/types/categoryType";

export const DEFAULT_CATEGORY_METADATA: CategoryMetadata = {
  category: '',
  course: '',
  requiredTier: 'free',
  image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5KkQtwIbr79T0mSRj6eAJqPf4kEid2ncgM5Nu',
  description: 'Twoja własna kategoria testów',
  duration: [25, 40, 60],
  popularity: 'Kategoria niestandardowa',
  status: true,
  numberOfQuestions: [10, 40]
};

export const CATEGORY_METADATA: Record<string, CategoryMetadata> = {
  "opiekun-medyczny": {
    category: "opiekun-medyczny",
    course: "opiekun-medyczny",
    requiredTier: "basic",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5hAALGCKaPSlWXcFVLft4M8kAgI2ECx19u7JN",
    description: "Przygotuj się do egzaminu Opiekuna Medycznego z naszymi kompleksowymi testami i pytaniami. Bogata baza pytań, która pomoże Ci w 100% przygotować sie do egzaminu państwowego i zdać za pierwszym razem!",
    duration: [25, 40, 60],
    popularity: "Bardzo popularny",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Testy - Kategoria: Opiekun Medyczny",
    keywords: ["opiekun", "med-14", "egzamin", "testy", "pytania", "zagadnienia", "medyczno-pielęgnacyjnych", "opiekuńczych", "baza"],
  },
   "fizjologia": {
    category: "fizjologia",
    course: "pielegniarstwo",
    requiredTier: "basic",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UN2L0ZIxs2k5EyuGdN4SRigYP6qreJDvtVZl",
    description: "Kompleksowe testy z fizjologii dla studentów pielęgniarstwa, obejmujące wszystkie istotne zagadnienia wymagane na egzaminach i w codziennej praktyce zawodowej. Sprawdź swoją wiedzę z układów organizmu, procesów fizjologicznych i funkcji życiowych.",
    duration: [25, 40, 60],
    popularity: "Sprawdź swoją wiedzę już teraz!",
    status: true,
    numberOfQuestions: [10,40],
    title: "Fizjologia - Testy dla Kierunku Pielęgniarstwo",
    keywords: ["fizjologia", "pielęgniarstwo", "układ krążenia", "układ oddechowy", "zdrowie", "opieka", "egzamin pielęgniarski", "testy wiedzy", "pytania egzaminacyjne"],
  }
};
