import { CategoryMetadata as CategoryMetadataType } from "@/types/categoryType";

type CategoryKey = "opiekun-medyczny" | "pielegniarstwo";

type CategoryMetadata = {
  title: string;
  description: string;
  keywords: string[];
};

export const DEFAULT_CATEGORY_METADATA: CategoryMetadataType = {
  category: '',
  image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5KkQtwIbr79T0mSRj6eAJqPf4kEid2ncgM5Nu',
  description: 'Twoja własna kategoria testów',
  duration: [25,40,60],
  popularity: 'Kategoria niestandardowa',
  status: true,
  numberOfQuestions: [10, 40]
};

export const CATEGORY_METADATA: Record<CategoryKey, CategoryMetadata> = {
    "opiekun-medyczny": {
      title: "Testy - Kategoria: Opiekun Medyczny",
      description: "Darmowa baza testów z kategorii, oparta na 2 ostatnich latach z egzaminów i kursu MED-14: Świadczenie usług medyczno-pielęgnacyjnych i opiekuńczych osobie chorej i niesamodzielnej",
      keywords: ["opiekun", "med-14", "egzamin", "testy", "pytania", "zagadnienia", "medyczno-pielęgnacyjnych", "opiekuńczych", "baza"],
    },
    "pielegniarstwo": {
      title: "Testy - Kategoria: Pielęgniarstwo",
      description: "Baza testów oparta na programie studiów medycznych kierunku pielęgniarstwo.",
      keywords: ["pielęgniarstwo", "zdrowie", "opieka", "studia pielęgniarskie", "egzamin", "testy", "pytania", "zagadnienia"],
    },
  };