"use client";

import { useActionState, useState, useEffect } from "react";
import { EMPTY_FORM_STATE } from "@/constants/formState";
import { startTestAction } from "@/actions/actions";
import { useRouter } from "next/navigation";
import Input from "./ui/Input";
import SubmitButton from "./SubmitButton";
import { useToastMessage } from "@/hooks/useToastMessage";
import getDeviceMeta from "@/helpers/getDeviceMeta";

export default function StartTestForm({ category }: { category: string }) {
  const [state, action] = useActionState(startTestAction, EMPTY_FORM_STATE);
  const noScriptFallback = useToastMessage(state);
  const router = useRouter();

  const meta = JSON.stringify(getDeviceMeta());

  useEffect(() => {
    if (state.status === "SUCCESS" && "sessionId" in state && state.sessionId) {
      router.push(`/panel/testy/${category}?sessionId=${state.sessionId}`);
    }
  }, [state.status, state, category, router]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input type="hidden" name="category" value={category} />
      <Input type="hidden" name="numberOfQuestions" value={10} />
      <Input type="hidden" name="durationMinutes" value={7} />
      <Input type="hidden" name="meta" value={meta} />
      <SubmitButton
        label="Rozpocznij Test"
        loading="Rozpoczyniane..."
        className="mt-8 inline-flex w-full items-center justify-center whitespace-nowrap rounded-md bg-[#ffc5c5]/70 border border-red-100/20 px-6 py-3 text-lg font-semibold text-zinc-950 hover:text-white shadow-lg transition-colors hover:bg-[#f58a8a]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50"
      />
      {noScriptFallback}
    </form>
  );
}
