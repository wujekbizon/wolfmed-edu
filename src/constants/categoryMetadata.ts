import { CategoryMetadata } from "@/types/categoryType";

export const DEFAULT_CATEGORY_METADATA: CategoryMetadata = {
  category: '',
  course: '',
  image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5KkQtwIbr79T0mSRj6eAJqPf4kEid2ncgM5Nu',
  description: 'Twoja własna kategoria testów',
  duration: [25, 40, 60],
  popularity: 'Kategoria niestandardowa',
  status: true,
  numberOfQuestions: [10, 40]
};

// Full category configuration including display, settings, and SEO
export const CATEGORY_METADATA: Record<string, CategoryMetadata> = {
  "opiekun-medyczny": {
    category: "opiekun-medyczny",
    course: "opiekun-medyczny",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5hAALGCKaPSlWXcFVLft4M8kAgI2ECx19u7JN",
    description: "Przygotuj się do egzaminu Opiekuna Medycznego z naszymi kompleksowymi testami i pytaniami. Bogata baza pytań, która pomoże Ci w 100% przygotować sie do egzaminu państwowego i zdać za pierwszym razem!",
    duration: [25, 40, 60],
    popularity: "Bardzo popularny",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Testy - Kategoria: Opiekun Medyczny",
    keywords: ["opiekun", "med-14", "egzamin", "testy", "pytania", "zagadnienia", "medyczno-pielęgnacyjnych", "opiekuńczych", "baza"],
  },
  "pielęgniarstwo": {
    category: "pielęgniarstwo",
    course: "pielegniarstwo",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5ICz8koequML1BazyDiNo5UcxtTn3s6YgW47C",
    description: "Ogólne testy z kierunku pielęgniarstwo obejmujące wszystkie działy obowiązujące w ścieżce Pielęgniarstwo. Egzamin sprawdzający ogólną wiedzę niezbędną do zaliczenia kierunku.",
    duration: [60],
    popularity: "Nowość - wkrótce dostępne",
    status: false,
    numberOfQuestions: [10, 40],
    title: "Testy - Kategoria: Pielęgniarstwo",
    keywords: ["pielęgniarstwo", "zdrowie", "opieka", "studia pielęgniarskie", "egzamin", "testy", "pytania", "zagadnienia"],
  },
  "socjologia": {
    category: "socjologia",
    course: "pielegniarstwo",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5KkQtwIbr79T0mSRj6eAJqPf4kEid2ncgM5Nu",
    description: "Testy z socjologii - teoria społeczna, metody badawcze. Dostępne tylko dla administratorów.",
    duration: [25, 40, 60],
    popularity: "Kategoria administracyjna",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Testy - Kategoria: Socjologia",
    keywords: ["socjologia", "teoria społeczna", "metody badawcze", "testy"],
  },
  "socjologia2": {
    category: "socjologia2",
    course: "pielegniarstwo",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5KkQtwIbr79T0mSRj6eAJqPf4kEid2ncgM5Nu",
    description: "Testy z socjologii - fakty.",
    duration: [25, 40, 60],
    popularity: "Kategoria administracyjna",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Testy - Kategoria: Socjologia 2",
    keywords: ["socjologia", "fakty", "testy"],
  }
};

// Helper to get category metadata
export function getCategoryMetadata(category: string): CategoryMetadata {
  return CATEGORY_METADATA[category] || { ...DEFAULT_CATEGORY_METADATA, category, course: '' };
}

// Get all category metadata as array (for backward compatibility)
export function getAllCategoryMetadata(): CategoryMetadata[] {
  return Object.values(CATEGORY_METADATA);
}
