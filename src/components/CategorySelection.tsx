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
        <Select categories={props.categories} label="Select a category: " />
      ) : (
        <div className="flex w-full flex-col">
          <Label label="Add new category:" htmlFor="addCategory" />
          <Input
            type="text"
            id="addCategory"
            name="newCategory"
            className="h-10 rounded border border-border/40 bg-neutral-900 px-2 text-sm text-white focus:border-amber-200/10 focus-visible:outline-none"
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