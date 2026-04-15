import CategoryGrid from "./CategoryGrid";
import NotesSection from "./NotesSection";
import LecturesSection from "./LecturesSection";
import CellList from "./cells/CellList";
import MaterialsSection from "./MaterialsSection";
import FlashcardsSection from "./FlashcardsSection";
import type { PopulatedCategories } from "@/types/categoryType";
import type { NotesType } from "@/types/notesTypes";
import type { MaterialsType } from "@/types/materialsTypes";
import type { Lecture } from "@/server/db/schema";

export default function LearningHubDashboard({
  categories,
  notes,
  materials,
  lectures,
  isPremium = false,
}: {
  categories: PopulatedCategories[];
  notes: NotesType[];
  materials: MaterialsType[];
  lectures: Lecture[];
  isPremium?: boolean;
}) {
  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-800 mb-2">Centrum Nauki</h1>
        <p className="text-zinc-600">
          Twoje osobiste środowisko do nauki i rozwoju
        </p>
      </div>
      <div className="bg-transparent xs:bg-white p-0 xs:p-4 sm:p-6 rounded-2xl shadow-none xs:shadow-xl border border-transparent xs:border-zinc-200/60">
        <h2 className="text-xl font-bold text-zinc-800 mb-6">Dostępne Kategorie</h2>
        <CategoryGrid categories={categories} />
      </div>
      <CellList isPremium={isPremium} />
      {isPremium && <LecturesSection lectures={lectures} />}
      <NotesSection notes={notes} />
      <FlashcardsSection notes={notes.map((n) => ({ id: n.id, title: n.title }))} />
      <MaterialsSection materials={materials} />
    </div>
  );
}