'use client'

import { useEffect, useState } from "react";
import { useTestFormStore } from "@/store/useTestFormStore";
import { PopulatedCategories } from "@/types/categoryType";
import Label from "./ui/Label";
import Input from "./ui/Input";
import DropdownSelect from "./ui/DropdownSelect";
import { getCategorySelectOptions } from "@/helpers/getCategorySelectOptions";
import LinkedSubjectSelect from "./LinkedSubjectSelect";
import SwitchLeftIcon from "./icons/SwitchLeftIcon";
import SwitchRightIcon from "./icons/SwitchRightIcon";
import type { FormState } from "@/types/actionTypes";
import FieldError from "./FieldError";

export default function CategorySelection(props: {
  categories: PopulatedCategories[];
  formState: FormState;
}) {
  const { selectionMethod, setSelectionMethod } = useTestFormStore();
  // The native select it replaces submitted its first option by default.
  const [category, setCategory] = useState(props.categories[0]?.value ?? "");

  useEffect(() => {
    if (props.formState.status !== "ERROR") return;

    const submittedCategory = props.formState.values?.category?.toString();
    if (submittedCategory) setCategory(submittedCategory);

    if (Object.hasOwn(props.formState.values ?? {}, "newCategory")) {
      setSelectionMethod("newCategory");
    } else if (Object.hasOwn(props.formState.values ?? {}, "category")) {
      setSelectionMethod("existingCategory");
    }
  }, [props.formState.timestamp, props.formState.status, props.formState.values, setSelectionMethod]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full items-end gap-6">
        {selectionMethod === "existingCategory" ? (
          <div className="flex w-full flex-col">
            <Label label="Wybierz kategorię:" htmlFor="category" className="text-xs sm:text-sm text-zinc-700 font-medium" />
            <DropdownSelect
              options={getCategorySelectOptions(props.categories, "value")}
              value={category}
              onSelect={setCategory}
              name="category"
              ariaLabel="Wybierz kategorię"
            />
            <FieldError formState={props.formState} name="category" />
          </div>
        ) : (
          <div className="flex w-full flex-col">
            <Label label="Dodaj nową kategorię:" htmlFor="addCategory" className="text-xs sm:text-sm text-zinc-700 font-medium" />
            <Input
              type="text"
              id="addCategory"
              name="newCategory"
              defaultValue={props.formState.values?.newCategory?.toString() || ""}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/90 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm"
            />
            <FieldError formState={props.formState} name="category" />
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

      {selectionMethod === "newCategory" && (
        <LinkedSubjectSelect categories={props.categories} formState={props.formState} />
      )}
    </div>
  );
}
