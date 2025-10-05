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

export default function StartTestForm({ category }: { category: PopulatedCategories }) {
  const { duration, numberOfQuestions, status } = category.data
  const [state, action] = useActionState(startTestAction, EMPTY_FORM_STATE);
  const noScriptFallback = useToastMessage(state);
  const router = useRouter();
  const [meta, setMeta] = useState<string>("");

  // We collect meta data from the user device, for future anti-cheat implementation.
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
          <Label htmlFor="numberOfQuestions" className="text-zinc-300" label="Ilość pytań" />
          <select
            id="numberOfQuestions"
            name="numberOfQuestions"
            defaultValue={numberOfQuestions[0]}
            className="block w-full px-2 py-2 rounded-md text-zinc-800 bg-white border outline-none border-zinc-300 focus:ring focus:ring-red-200 transition sm:text-sm"
          >{
              numberOfQuestions.map((n) => (
                // we assume that exam will always have only 40 questions, rest will be practice test
                <option key={n} value={n}>{n !== 40 ? "Praktyka" : "Egzamin"} ({n} pytań)</option>
              ))
            }
          </select>
        </div>
        <div className="flex-1">
          <Label htmlFor="durationMinutes" className="text-zinc-300" label="Czas trwania" />
          <select
            id="durationMinutes"
            name="durationMinutes"
            defaultValue={duration[0]}
            className="block w-full px-2 py-2 rounded-md text-zinc-800 bg-white border outline-none border-zinc-300 focus:ring focus:ring-red-200 transition sm:text-sm"
          >
            {
              category.data.duration.map((d) => (
                <option key={d} value={d}>{d} minut</option>
              ))
            }
          </select>
        </div>
      </div>
      <SubmitButton
        disabled={!status}
        label="Rozpocznij Test"
        loading="Rozpoczyniane..."
      />
      {noScriptFallback}
    </form>
  );
}
