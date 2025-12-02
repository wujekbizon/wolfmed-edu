"use client";

import { useActionState } from "react";
import { EMPTY_FORM_STATE } from "@/constants/formState";
import { useToastMessage } from "@/hooks/useToastMessage";
import { Textarea } from "./ui/Textarea";
import Label from "./ui/Label";
import Answers from "./Answers";
import FieldError from "./FieldError";
import SubmitButton from "./SubmitButton";
import type { PopulatedCategories } from "@/types/categoryType";
import CategorySelection from "./CategorySelection";
import { createTestAction } from "@/actions/actions";

export default function CreateTestForm(props: { categories: PopulatedCategories[] }) {
  const [formState, action] = useActionState(
    createTestAction,
    EMPTY_FORM_STATE,
  );
  const noScriptFallback = useToastMessage(formState);

  return (
    <form
      className="flex w-full text-zinc-800 flex-col bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-zinc-200/60 hover:shadow-lg transition-all duration-300 px-4 py-6"
      action={action}
    >
      <div className="flex w-full flex-col items-end sm:flex-row">
        <div className="flex w-full flex-col gap-1">
          <CategorySelection categories={props.categories} />
          <FieldError formState={formState} name="category" />
        </div>
      </div>
      <div className="flex flex-col">
        <Label htmlFor="question" label="Pytanie:" className="text-xs sm:text-sm text-zinc-700 font-medium" />
        <Textarea id="question" name="question" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/90 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-transparent" />
        <FieldError formState={formState} name="question" />
      </div>
      <div className="flex flex-col items-center ">
        <Answers formState={formState} />
      </div>
      <FieldError formState={formState} name="checkbox" />
      <div className="flex w-full self-center md:w-1/3">
        <SubmitButton label="Utwórz Test" loading="Tworzenie..." />
      </div>
      {noScriptFallback}
    </form>
  );
}
