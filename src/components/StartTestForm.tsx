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

export default function StartTestForm({ category }: { category: string }) {
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
      router.push(`/panel/testy/${category}?sessionId=${state.sessionId}`);
    }
  }, [state.status, state, category, router]);

  return (
    <form action={action} className="flex flex-col">
      <Input type="hidden" name="category" value={category} />
      <Input type="hidden" name="meta" value={meta} />
      <div className="flex flex-col lg:flex-row w-full gap-4">
        <div className="flex-1">
          <Label htmlFor="numberOfQuestions" className="text-zinc-300" label="Ilość pytań" />
          <select
            id="numberOfQuestions"
            name="numberOfQuestions"
            defaultValue={40}
            className="block w-full  px-2 py-2 rounded-md text-zinc-800 bg-white border outline-none border-zinc-300 focus:ring focus:ring-red-200 transition sm:text-sm"
          >
            <option value={40}>Egzamin (40 pytań)</option>
            <option value={10}>Praktyka (10 pytań)</option>
          </select>
        </div>
        <div className="flex-1">
          <Label htmlFor="durationMinutes" className="text-zinc-300" label="Czas trwania" />
          <select
            id="durationMinutes"
            name="durationMinutes"
            defaultValue={25}
            className="block w-full px-2 py-2 rounded-md text-zinc-800 bg-white border outline-none border-zinc-300 focus:ring focus:ring-red-200 transition sm:text-sm"
          >
            <option value={25}>25 minut</option>
          </select>
        </div>
      </div>
      <SubmitButton
        label="Rozpocznij Test"
        loading="Rozpoczyniane..."
        className="mt-8 inline-flex w-full items-center justify-center whitespace-nowrap rounded-md bg-[#ffc5c5]/70 border border-red-100/20 px-6 py-3 text-lg font-semibold text-zinc-950 hover:text-white shadow-lg transition-colors hover:bg-[#f58a8a]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50"
      />
      {noScriptFallback}
    </form>
  );
}
