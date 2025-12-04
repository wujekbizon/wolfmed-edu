import { useTestFormStore } from "@/store/useTestFormStore";
import { PopulatedCategories } from "@/types/categoryType";
import Label from "./ui/Label";
import Input from "./ui/Input";
import Select from "./ui/Select";
import SwitchLeftIcon from "./icons/SwitchLeftIcon";
import SwitchRightIcon from "./icons/SwitchRightIcon";

export default function CategorySelection(props: { categories: PopulatedCategories[] }) {
  const { selectionMethod, setSelectionMethod } = useTestFormStore();
  return (
    <div className="flex w-full items-end gap-6">
      {selectionMethod === "existingCategory" ? (
        <Select categories={props.categories} label="Wybierz kategorię:" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm" />
      ) : (
        <div className="flex w-full flex-col">
          <Label label="Dodaj nową kategorię:" htmlFor="addCategory" className="text-xs sm:text-sm text-zinc-700 font-medium" />
          <Input
            type="text"
            id="addCategory"
            name="newCategory"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/90 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm"
          />
        </div>
      )}

      {selectionMethod === "existingCategory" ? (
        <SwitchLeftIcon onClick={() => setSelectionMethod("newCategory")} />
      ) : (
        <SwitchRightIcon
          onClick={() => setSelectionMethod("existingCategory")}
        />
      )}
    </div>
  );
}