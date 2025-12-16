"use client";

import { useActionState, useEffect } from "react";
import { EMPTY_FORM_STATE } from "@/constants/formState";
import { startTestAction } from "@/actions/actions";
import { useRouter } from "next/navigation";
import Input from "./ui/Input";
import SubmitButton from "./SubmitButton";
import { useToastMessage } from "@/hooks/useToastMessage";
import getDeviceMeta from "@/helpers/getDeviceMeta";
import { useState } from "react";
import Label from "./ui/Label";
import { PopulatedCategories } from "@/types/categoryType";
import { DEFAULT_CATEGORY_METADATA } from "@/constants/categoryMetadata";

export default function StartTestForm({ category }: { category: PopulatedCategories }) {
  const categoryData = category.data || DEFAULT_CATEGORY_METADATA;
  const { duration, numberOfQuestions, status } = categoryData;
  const availableQuestions = category.count;
  const [state, action] = useActionState(startTestAction, EMPTY_FORM_STATE);
  const noScriptFallback = useToastMessage(state);
  const router = useRouter();
  const [meta, setMeta] = useState<string>("");

  useEffect(() => {
    setMeta(JSON.stringify(getDeviceMeta()));
  }, []);

  useEffect(() => {
    if (state.status === "SUCCESS" && "sessionId" in state && state.sessionId) {
      router.push(`/panel/testy/${category.value}?sessionId=${state.sessionId}`);
    }
  }, [state.status, state, category.value, router]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input type="hidden" name="category" value={category.value} />
      <Input type="hidden" name="meta" value={meta} />
      <div className="flex flex-col lg:flex-row w-full gap-4">
        <div className="flex-1">
          <Label htmlFor={`numberOfQuestions-${category.value}`} className="text-zinc-300" label="Ilość pytań" />
          <select
            id={`numberOfQuestions-${category.value}`}
            name="numberOfQuestions"
            defaultValue={numberOfQuestions.find((n: number) => n <= availableQuestions) || numberOfQuestions[0]}
            className="block w-full px-2 py-2 rounded-md text-zinc-800 bg-white border outline-none border-zinc-300 focus:ring focus:ring-red-200 transition sm:text-sm"
          >{
              numberOfQuestions.map((n: number) => {
                const isDisabled = n > availableQuestions;
                const label = n !== 40 ? "Praktyka" : "Egzamin";
                return (
                  <option key={n} value={n} disabled={isDisabled}>
                    {label} ({n} pytań) 
                  </option>
                );
              })
            }
          </select>
        </div>
        <div className="flex-1">
          <Label htmlFor={`durationMinutes-${category.value}`} className="text-zinc-300" label="Czas trwania" />
          <select
            id={`durationMinutes-${category.value}`}
            name="durationMinutes"
            defaultValue={duration[0]}
            className="block w-full px-2 py-2 rounded-md text-zinc-800 bg-white border outline-none border-zinc-300 focus:ring focus:ring-red-200 transition sm:text-sm"
          >
            {
              duration.map((d: number) => (
                <option key={d} value={d}>{d} minut</option>
              ))
            }
          </select>
        </div>
      </div>
      <SubmitButton
        disabled={!status || availableQuestions < 10}
        label={availableQuestions < 10 ? `Minimum 10 pytań (masz ${availableQuestions})` : "Rozpocznij Test"}
        loading="Rozpoczynanie..."
      />
      {noScriptFallback}
    </form>
  );
}
