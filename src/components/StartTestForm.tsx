"use client";

import { useActionState, useEffect, useState } from "react";
import { EMPTY_FORM_STATE } from "@/constants/formState";
import { startTestAction } from "@/actions/actions";
import { useRouter } from "next/navigation";
import Input from "./ui/Input";
import SubmitButton from "./SubmitButton";
import { useToastMessage } from "@/hooks/useToastMessage";
import PracticeTestButton from "./PracticeTestButton";
import getDeviceMeta from "@/helpers/getDeviceMeta";
import Label from "./ui/Label";
import { PopulatedCategories } from "@/types/categoryType";
import { DEFAULT_CATEGORY_METADATA } from "@/constants/categoryMetadata";
import type { PracticeExamResume } from "@/types/practiceResumeTypes";

export default function StartTestForm({
  category,
  practiceAttempts = [],
}: {
  category: PopulatedCategories
  practiceAttempts?: PracticeExamResume[]
}) {
  const categoryData = category.data || DEFAULT_CATEGORY_METADATA;
  const { duration, numberOfQuestions, status } = categoryData;
  const availableQuestions = category.count;
  const [state, action] = useActionState(startTestAction, EMPTY_FORM_STATE);
  const noScriptFallback = useToastMessage(state);
  const router = useRouter();
  const [meta, setMeta] = useState<string>("");
  const initialQuestionCount = numberOfQuestions.find((n: number) => n <= availableQuestions) || numberOfQuestions[0] || 10;
  const [questionCount, setQuestionCount] = useState(initialQuestionCount);
  const matchingPractice = practiceAttempts.find((attempt) => attempt.numberOfQuestions === questionCount);

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
            value={questionCount}
            onChange={(event) => setQuestionCount(Number(event.target.value))}
            className="block w-full px-2 py-2 rounded-md text-zinc-800 bg-white border outline-none border-zinc-300 focus:ring focus:ring-red-200 transition sm:text-sm"
          >{
              numberOfQuestions.map((n: number) => {
                const isDisabled = n > availableQuestions;
                return (
                  <option key={n} value={n} disabled={isDisabled}>
                    {n} pytań
                  </option>
                );
              })
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
              duration.map((d: number) => (
                <option key={d} value={d}>{d} minut</option>
              ))
            }
          </select>
          <p className="mt-1 text-xs text-zinc-400">Dotyczy tylko egzaminu właściwego.</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <SubmitButton
          className="flex-1"
          disabled={!status || availableQuestions < 10}
          label={availableQuestions < 10 ? `Minimum 10 pytań (masz ${availableQuestions})` : "Rozpocznij egzamin"}
          loading="Rozpoczynanie..."
        />
        <PracticeTestButton
          category={category.value}
          questionCount={questionCount}
          activeSessionId={matchingPractice?.sessionId}
          disabled={!status || availableQuestions < 10}
        />
      </div>
      {noScriptFallback}
    </form>
  );
}
