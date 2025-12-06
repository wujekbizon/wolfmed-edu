import CategoryGrid from "./CategoryGrid";
import NotesSection from "./NotesSection";
import CellList from "./cells/CellList";
import MaterialsSection from "./MaterialsSection";
import PremiumLock from "./PremiumLock";
import type { PopulatedCategories } from "@/types/categoryType";
import type { NotesType } from "@/types/notesTypes";
import type { MaterialsType } from "@/types/materialsTypes";

export default function LearningHubDashboard({
  categories,
  notes,
  materials,
  isSupporter = false,
}: {
  categories: PopulatedCategories[];
  notes: NotesType[];
  materials: MaterialsType[];
  isSupporter?: boolean;
}) {
  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-800 mb-2">Centrum Nauki</h1>
        <p className="text-zinc-600">
          Twoje osobiste środowisko do nauki i rozwoju
        </p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60">
        <h2 className="text-xl font-bold text-zinc-800 mb-6">Dostępne Testy</h2>
        <CategoryGrid categories={categories} />
      </div>
      <div className="relative">
        {!isSupporter && <PremiumLock />}
        <div className={!isSupporter ? "opacity-30 pointer-events-none" : ""}>
          <CellList />
        </div>
      </div>
      <div className="relative">
        {!isSupporter && <PremiumLock />}
        <div className={!isSupporter ? "opacity-30 pointer-events-none" : ""}>
          <NotesSection notes={notes} />
        </div>
      </div>
      
      <div className="relative">
        {!isSupporter && <PremiumLock />}
        <div className={!isSupporter ? "opacity-30 pointer-events-none" : ""}>
          <MaterialsSection materials={materials} />
        </div>
      </div>
    </div>
  );
}
