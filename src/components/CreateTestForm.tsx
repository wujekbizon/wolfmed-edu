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
      className="flex w-full text-white flex-col rounded-lg border border-border/40 bg-zinc-800/50 backdrop-blur-sm px-4 py-6 lg:w-2/3"
      action={action}
    >
      <div className="flex w-full flex-col items-end sm:flex-row">
        <div className="flex w-full flex-col gap-1">
          <CategorySelection categories={props.categories} />
          <FieldError formState={formState} name="category" />
        </div>
      </div>
      <div className="flex flex-col">
        <Label htmlFor="question" label="Question:" />
        <Textarea id="question" name="question" />
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
