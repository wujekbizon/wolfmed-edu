import Link from "next/link";
import { Headphones } from "lucide-react";
import CategoryGrid from "./CategoryGrid";
import NotesSection from "./NotesSection";
import CellList from "./cells/CellList";
import MaterialsSection from "./MaterialsSection";
import FlashcardsSection from "./FlashcardsSection";
import type { PopulatedCategories } from "@/types/categoryType";
import type { NotesType } from "@/types/notesTypes";
import type { MaterialsType } from "@/types/materialsTypes";

export default function LearningHubDashboard({
  categories,
  notes,
  materials,
  isPremium = false,
}: {
  categories: PopulatedCategories[];
  notes: NotesType[];
  materials: MaterialsType[];
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
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60">
        <h2 className="text-xl font-bold text-zinc-800 mb-6">Dostępne Testy</h2>
        <CategoryGrid categories={categories} />
      </div>
      <CellList isPremium={isPremium} />
      {isPremium && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#ff9898]/20 to-fuchsia-100 rounded-lg">
                <Headphones className="w-5 h-5 text-[#e07070]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-800">Twoje wykłady</h2>
                <p className="text-sm text-zinc-500">Wygenerowane wykłady audio</p>
              </div>
            </div>
            <Link
              href="/panel/nauka/wykłady"
              className="text-sm font-medium text-[#e07070] hover:text-fuchsia-500 transition-colors"
            >
              Wszystkie wykłady →
            </Link>
          </div>
        </div>
      )}
      <NotesSection notes={notes} />
      <FlashcardsSection notes={notes.map((n) => ({ id: n.id, title: n.title }))} />
      <MaterialsSection materials={materials} isSupporter={isPremium} />
    </div>
  );
}
